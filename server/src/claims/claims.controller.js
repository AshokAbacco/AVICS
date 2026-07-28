import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

export const createClaim = async (req, res) => {
  try {
    const {
      claimNumber,
      caseId,
      claimantName,
      policyNumber,
      claimType,
      claimAmount,
      approvedAmount,
      compensationAmount,
      submittedDate,
      decisionDate,
      paymentDate,
      status,
      paymentStatus,
      insuranceCompany,
      surveyorName,
      remarks,
      rejectionReason,
    } = req.body;

    const requiredFields = [
      "claimNumber",
      "caseId",
      "claimantName",
      "claimType",
      "claimAmount",
      "status",
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

    // Check Case exists
    const existingCase = await prisma.case.findUnique({
      where: {
        id: caseId,
      },
    });

    if (!existingCase) {
      return res.status(404).json({
        success: false,
        message: "Case not found.",
      });
    }

    // Duplicate Claim Number
    const existingClaim = await prisma.claim.findUnique({
      where: {
        claimNumber,
      },
    });

    if (existingClaim) {
      return res.status(400).json({
        success: false,
        message: "Claim Number already exists.",
      });
    }

    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        caseId,
        claimantName,
        policyNumber,
        claimType,
        claimAmount: Number(claimAmount),
        approvedAmount: Number(approvedAmount || 0),
        compensationAmount: Number(compensationAmount || 0),

        submittedDate: submittedDate
          ? new Date(submittedDate)
          : new Date(),

        decisionDate: decisionDate
          ? new Date(decisionDate)
          : null,

        paymentDate: paymentDate
          ? new Date(paymentDate)
          : null,

        status,
        paymentStatus,

        insuranceCompany,
        surveyorName,
        remarks,
        rejectionReason,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Claim created successfully.",
      data: claim,
    });
  } catch (error) {
    console.error("Create Claim Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create claim.",
      error: error.message,
    });
  }
};

/**
 * Get All Claims
 */
export const getClaims = async (req, res) => {
  try {
    const claims = await prisma.claim.findMany({
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            status: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: claims.length,
      data: claims,
    });
  } catch (error) {
    console.error("getClaims error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch claims.",
      error: error.message,
    });
  }
};

/**
 * Get Claim By ID
 */
export const getClaimById = async (req, res) => {
  try {
    const { id } = req.params;

    const claim = await prisma.claim.findUnique({
      where: {
        id,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            caseType: true,
            status: true,
          },
        },
      },
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: claim,
    });
  } catch (error) {
    console.error("getClaimById error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch claim.",
      error: error.message,
    });
  }
};

/**
 * Update Claim
 */
export const updateClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClaim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    const updatedClaim = await prisma.claim.update({
      where: {
        id,
      },
      data: {
        claimNumber: req.body.claimNumber,
        caseId: req.body.caseId,
        claimantName: req.body.claimantName,
        policyNumber: req.body.policyNumber,
        claimType: req.body.claimType,

        claimAmount:
          req.body.claimAmount !== undefined
            ? Number(req.body.claimAmount)
            : undefined,

        approvedAmount:
          req.body.approvedAmount !== undefined
            ? Number(req.body.approvedAmount)
            : undefined,

        compensationAmount:
          req.body.compensationAmount !== undefined
            ? Number(req.body.compensationAmount)
            : undefined,

        submittedDate: req.body.submittedDate
          ? new Date(req.body.submittedDate)
          : undefined,

        decisionDate:
          req.body.decisionDate === ""
            ? null
            : req.body.decisionDate
            ? new Date(req.body.decisionDate)
            : undefined,

        paymentDate:
          req.body.paymentDate === ""
            ? null
            : req.body.paymentDate
            ? new Date(req.body.paymentDate)
            : undefined,

        status: req.body.status,
        paymentStatus: req.body.paymentStatus,
        insuranceCompany: req.body.insuranceCompany,
        surveyorName: req.body.surveyorName,
        remarks: req.body.remarks,
        rejectionReason: req.body.rejectionReason,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Claim updated successfully.",
      data: updatedClaim,
    });
  } catch (error) {
    console.error("updateClaim error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update claim.",
      error: error.message,
    });
  }
};

/**
 * Delete Claim
 */
export const deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClaim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!existingClaim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    await prisma.claim.delete({
      where: {
        id,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Claim deleted successfully.",
    });
  } catch (error) {
    console.error("deleteClaim error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete claim.",
      error: error.message,
    });
  }
};
