// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title MedicalAuditTrail
 * @dev Immutable audit trail for medical records on Polygon Mumbai
 */
contract MedicalAuditTrail {
    
    struct AuditEntry {
        string recordId;
        string action;
        address userAddress;
        string userId;
        bytes32 dataHash;
        uint256 timestamp;
        string metadata;
    }
    
    AuditEntry[] public auditLog;
    mapping(string => uint256[]) public recordAudits;
    mapping(string => bytes32) public recordHashes;
    
    event AuditLogged(
        string indexed recordId,
        string action,
        address indexed userAddress,
        uint256 timestamp,
        bytes32 dataHash
    );
    
    event RecordHashUpdated(
        string indexed recordId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );
    
    /**
     * @dev Log an audit entry for a medical record
     * @param _recordId The MongoDB ObjectId of the medical record
     * @param _action The action performed (CREATE, UPDATE, DELETE, ACCESS_GRANTED, etc.)
     * @param _userId The MongoDB ObjectId of the user performing the action
     * @param _dataHash SHA-256 hash of the record data
     * @param _metadata Additional metadata as JSON string
     * @return The index of the audit entry in the log
     */
    function logAudit(
        string memory _recordId,
        string memory _action,
        string memory _userId,
        bytes32 _dataHash,
        string memory _metadata
    ) public returns (uint256) {
        
        AuditEntry memory entry = AuditEntry({
            recordId: _recordId,
            action: _action,
            userAddress: msg.sender,
            userId: _userId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            metadata: _metadata
        });
        
        auditLog.push(entry);
        uint256 auditIndex = auditLog.length - 1;
        recordAudits[_recordId].push(auditIndex);
        
        bytes32 oldHash = recordHashes[_recordId];
        recordHashes[_recordId] = _dataHash;
        
        emit AuditLogged(_recordId, _action, msg.sender, block.timestamp, _dataHash);
        
        if (oldHash != bytes32(0)) {
            emit RecordHashUpdated(_recordId, oldHash, _dataHash, block.timestamp);
        }
        
        return auditIndex;
    }
    
    /**
     * @dev Get all audit entries for a specific record
     * @param _recordId The MongoDB ObjectId of the medical record
     * @return Array of audit entries
     */
    function getRecordAudits(string memory _recordId) 
        public 
        view 
        returns (AuditEntry[] memory) 
    {
        uint256[] memory indices = recordAudits[_recordId];
        AuditEntry[] memory entries = new AuditEntry[](indices.length);
        
        for (uint256 i = 0; i < indices.length; i++) {
            entries[i] = auditLog[indices[i]];
        }
        
        return entries;
    }
    
    /**
     * @dev Verify if the current data matches what's stored on blockchain
     * @param _recordId The MongoDB ObjectId of the medical record
     * @param _currentHash SHA-256 hash of the current record data
     * @return isValid Whether the hashes match
     * @return storedHash The hash stored on blockchain
     */
    function verifyRecordIntegrity(string memory _recordId, bytes32 _currentHash) 
        public 
        view 
        returns (bool isValid, bytes32 storedHash) 
    {
        storedHash = recordHashes[_recordId];
        isValid = (storedHash == _currentHash);
        return (isValid, storedHash);
    }
    
    /**
     * @dev Get total number of audit entries across all records
     * @return Total count of audits
     */
    function getAuditCount() public view returns (uint256) {
        return auditLog.length;
    }
    
    /**
     * @dev Get a specific audit entry by index
     * @param index The index in the audit log
     * @return The audit entry
     */
    function getAudit(uint256 index) public view returns (AuditEntry memory) {
        require(index < auditLog.length, "Index out of bounds");
        return auditLog[index];
    }
}
