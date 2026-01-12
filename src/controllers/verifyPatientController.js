// Verify Patient Email - For doctors/lab assistants to verify patient exists
export const verifyPatientEmail = async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        // Find patient by email
        const patient = await User.findOne({ email, role: 'patient' })
            .select('_id firstName lastName email phoneNumber dateOfBirth');

        if (!patient) {
            return res.status(404).json({
                success: false,
                message: 'Patient not found with this email',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Patient found',
            data: { user: patient },
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Failed to verify patient email',
            error: error.message,
        });
    }
};
