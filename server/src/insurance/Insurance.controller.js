import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

/**
 * Create Insurance Detail
 */
export const createInsurance = async (req, res) => {
  try {
    const {
      vehicleId,
      insuranceCompany,
      policyNumber,
      policyHolder,
      policyStartDate,
      policyEndDate,
      surveyor,
      coverageAmount,
      estimatedClaimAmount,
      remarks,
    } = req.body;

    const requiredFields = [
      "vehicleId",
      "insuranceCompany",
      "policyNumber",
      "policyHolder",
    ];

    const missing = requiredFields.filter((field) => isMissing(req.body[field]));

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `${missing.join(", ")} ${
          missing.length > 1 ? "are" : "is"
        } required.`,
      });
    }

    // Check Vehicle exists
    const existingVehicle = await prisma.vehicle.findUnique({
      where: {
        id: vehicleId,
      },
    });

    if (!existingVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found.",
      });
    }

    // Duplicate Policy Number
    const existingPolicy = await prisma.insuranceDetail.findUnique({
      where: {
        policyNumber,
      },
    });

    if (existingPolicy) {
      return res.status(400).json({
        success: false,
        message: "Policy Number already exists.",
      });
    }

    const insurance = await prisma.insuranceDetail.create({
      data: {
        vehicleId,
        insuranceCompany,
        policyNumber,
        policyHolder,

        policyStartDate: policyStartDate ? new Date(policyStartDate) : null,
        policyEndDate: policyEndDate ? new Date(policyEndDate) : null,

        surveyor,
        coverageAmount:
          coverageAmount !== undefined && coverageAmount !== ""
            ? Number(coverageAmount)
            : null,
        estimatedClaimAmount:
          estimatedClaimAmount !== undefined && estimatedClaimAmount !== ""
            ? Number(estimatedClaimAmount)
            : null,
        remarks,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Insurance detail created successfully.",
      data: insurance,
    });
  } catch (error) {
    console.error("Create Insurance Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create insurance detail.",
      error: error.message,
    });
  }
};

/**
 * Get All Insurance Details
 */
export const getInsurances = async (req, res) => {
  try {
    const insurances = await prisma.insuranceDetail.findMany({
      include: {
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            vehicleType: true,
            ownerName: true,
            caseId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: insurances.length,
      data: insurances,
    });
  } catch (error) {
    console.error("getInsurances error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch insurance details.",
      error: error.message,
    });
  }
};

/**
 * Get Insurance Detail By ID
 */
export const getInsuranceById = async (req, res) => {
  try {
    const { id } = req.params;

    const insurance = await prisma.insuranceDetail.findUnique({
      where: {
        id,
      },
      include: {
        vehicle: {
          select: {
            id: true,
            registrationNumber: true,
            vehicleType: true,
            ownerName: true,
            caseId: true,
          },
        },
      },
    });

    if (!insurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance detail not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: insurance,
    });
  } catch (error) {
    console.error("getInsuranceById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch insurance detail.",
      error: error.message,
    });
  }
};

/**
 * Update Insurance Detail
 */
export const updateInsurance = async (req, res) => {
  try {
    const { id } = req.params;

    const existingInsurance = await prisma.insuranceDetail.findUnique({
      where: { id },
    });

    if (!existingInsurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance detail not found.",
      });
    }

    const updatedInsurance = await prisma.insuranceDetail.update({
      where: {
        id,
      },
      data: {
        vehicleId: req.body.vehicleId,
        insuranceCompany: req.body.insuranceCompany,
        policyNumber: req.body.policyNumber,
        policyHolder: req.body.policyHolder,

        policyStartDate:
          req.body.policyStartDate === ""
            ? null
            : req.body.policyStartDate
            ? new Date(req.body.policyStartDate)
            : undefined,

        policyEndDate:
          req.body.policyEndDate === ""
            ? null
            : req.body.policyEndDate
            ? new Date(req.body.policyEndDate)
            : undefined,

        surveyor: req.body.surveyor,

        coverageAmount:
          req.body.coverageAmount !== undefined
            ? Number(req.body.coverageAmount)
            : undefined,

        estimatedClaimAmount:
          req.body.estimatedClaimAmount !== undefined
            ? Number(req.body.estimatedClaimAmount)
            : undefined,

        remarks: req.body.remarks,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Insurance detail updated successfully.",
      data: updatedInsurance,
    });
  } catch (error) {
    console.error("updateInsurance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update insurance detail.",
      error: error.message,
    });
  }
};

/**
 * Delete Insurance Detail
 */
export const deleteInsurance = async (req, res) => {
  try {
    const { id } = req.params;

    const existingInsurance = await prisma.insuranceDetail.findUnique({
      where: { id },
    });

    if (!existingInsurance) {
      return res.status(404).json({
        success: false,
        message: "Insurance detail not found.",
      });
    }

    await prisma.insuranceDetail.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Insurance detail deleted successfully.",
    });
  } catch (error) {
    console.error("deleteInsurance error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete insurance detail.",
      error: error.message,
    });
  }
};