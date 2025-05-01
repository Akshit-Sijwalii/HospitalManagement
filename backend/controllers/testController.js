import Test from "../modules/testModel.js";
import user from "../modules/userModel.js"; // your actual patient model

// Book a test
export const bookTest = async (req, res) => {
  try {
    const { patientEmail, testType, date } = req.body;

    if (!["CT Scan", "X-Ray", "MRI", "Ultrasound"].includes(testType)) {
      return res.status(400).json({ message: "Invalid test type" });
    }

    // Find patient
    const patient = await user.findOne({ email: patientEmail });
    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    // Check if the patient already has a test of the same type (ignore date)
    const existingTest = await Test.findOne({
      patientId: patient._id,
      testType,
    });

    if (existingTest) {
      return res.status(409).json({
        message: `Test of type '${testType}' already booked for this patient.`,
      });
    }

    const formattedDate = new Date(date); // still saving the given date

    // Create and save new test
    const test = new Test({
      patientId: patient._id,
      testType,
      date: formattedDate,
    });

    await test.save();

    res.status(201).json({
      message: "Test booked successfully",
      test,
    });
  } catch (error) {
    res.status(500).json({ message: "Error booking test", error: error.message });
  }
};



// View all booked tests
export const getAllTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate("patientId", "name email") // populate patient name and email
      .sort({ createdAt: -1 });

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};

// Get all tests by patient ID
export const getTestsByPatientId = async (req, res) => {
  try {
    const patientId = req.params.id;

    const tests = await Test.find({ patientId })
      .populate("patientId", "name email")
      .sort({ createdAt: -1 });

    if (tests.length === 0) {
      return res.status(404).json({ message: "No tests found for this patient" });
    }

    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: "Error fetching tests", error: error.message });
  }
};


// Cancel test
export const cancelTest = async (req, res) => {
  try {
    const testId = req.params.id;
    const test = await Test.findByIdAndDelete(testId);

    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json({ message: "Test cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error cancelling test", error });
  }
};
