import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function isMissing(value) {
  return value === undefined || value === null || value === "";
}

// Resolves and validates the victim/vehicle link for a claim. Confirms
// whichever one is provided actually belongs to the given case, and
// derives claimantName from it when not explicitly typed.
async function resolveClaimant({ caseId, victimId, vehicleId, claimantName }) {
  if (victimId && vehicleId) {
    const err = new Error("A claim can be linked to a victim or a vehicle, not both.");
    err.statusCode = 400;
    throw err;
  }

  let victim = null;
  let vehicle = null;

  if (victimId) {
    victim = await prisma.victim.findUnique({ where: { id: victimId } });
    if (!victim || victim.deletedAt) {
      const err = new Error("Linked victim not found.");
      err.statusCode = 404;
      throw err;
    }
    if (victim.caseId !== caseId) {
      const err = new Error("The selected victim does not belong to this case.");
      err.statusCode = 400;
      throw err;
    }
  }

  if (vehicleId) {
    vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle || vehicle.deletedAt) {
      const err = new Error("Linked vehicle not found.");
      err.statusCode = 404;
      throw err;
    }
    if (vehicle.caseId !== caseId) {
      const err = new Error("The selected vehicle does not belong to this case.");
      err.statusCode = 400;
      throw err;
    }
  }

  const resolvedName = claimantName?.trim() || victim?.name || vehicle?.ownerName || null;
  if (!resolvedName) {
    const err = new Error("claimantName is required when no victim or vehicle is linked.");
    err.statusCode = 400;
    throw err;
  }

  return { claimantName: resolvedName };
}

export const createClaim = async (req, res) => {
  try {
    const {
      claimNumber,
      caseId,
      victimId,
      vehicleId,
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

    if (Number.isNaN(Number(claimAmount))) {
      return res.status(400).json({ success: false, message: "claimAmount must be a valid number." });
    }

    if (status === "REJECTED" && !rejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required when status is REJECTED.",
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

    // Resolve + validate the victim/vehicle link (also derives claimantName
    // when it isn't explicitly provided).
    let claimant;
    try {
      claimant = await resolveClaimant({ caseId, victimId, vehicleId, claimantName });
    } catch (err) {
      return res.status(err.statusCode || 400).json({ success: false, message: err.message });
    }

    const claim = await prisma.claim.create({
      data: {
        claimNumber,
        caseId,
        victimId: victimId || null,
        vehicleId: vehicleId || null,
        claimantName: claimant.claimantName,
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

    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Claim Number already exists." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create claim.",
    });
  }
};

/**
 * Get All Claims
 * Supports optional ?caseId= / ?victimId= / ?vehicleId= / ?status= /
 * ?paymentStatus= query filters, all additive -- calling with no query
 * params behaves exactly as before (every non-deleted claim).
 */
export const getClaims = async (req, res) => {
  try {
    const { caseId, victimId, vehicleId, status, paymentStatus } = req.query;

    const claims = await prisma.claim.findMany({
      where: {
        deletedAt: null,
        ...(caseId ? { caseId } : {}),
        ...(victimId ? { victimId } : {}),
        ...(vehicleId ? { vehicleId } : {}),
        ...(status ? { status } : {}),
        ...(paymentStatus ? { paymentStatus } : {}),
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
        victim: {
          select: { id: true, name: true, age: true, gender: true, mobile: true },
        },
        vehicle: {
          select: { id: true, registrationNumber: true, vehicleType: true, ownerName: true },
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
        victim: {
          select: { id: true, name: true, age: true, gender: true, mobile: true, address: true },
        },
        vehicle: {
          select: { id: true, registrationNumber: true, vehicleType: true, ownerName: true },
        },
      },
    });

    if (!claim || claim.deletedAt) {
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

    if (!existingClaim || existingClaim.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    const targetCaseId = req.body.caseId || existingClaim.caseId;

    if (req.body.caseId && req.body.caseId !== existingClaim.caseId) {
      const targetCase = await prisma.case.findUnique({ where: { id: targetCaseId } });
      if (!targetCase) {
        return res.status(404).json({ success: false, message: "Case not found." });
      }
    }

    const victimIdProvided = Object.prototype.hasOwnProperty.call(req.body, "victimId");
    const vehicleIdProvided = Object.prototype.hasOwnProperty.call(req.body, "vehicleId");

    const nextVictimId = victimIdProvided ? (req.body.victimId || null) : existingClaim.victimId;
    const nextVehicleId = vehicleIdProvided ? (req.body.vehicleId || null) : existingClaim.vehicleId;

    let claimant = { claimantName: existingClaim.claimantName };
    if (victimIdProvided || vehicleIdProvided || req.body.claimantName !== undefined) {
      try {
        claimant = await resolveClaimant({
          caseId: targetCaseId,
          victimId: nextVictimId,
          vehicleId: nextVehicleId,
          claimantName: req.body.claimantName !== undefined ? req.body.claimantName : existingClaim.claimantName,
        });
      } catch (err) {
        return res.status(err.statusCode || 400).json({ success: false, message: err.message });
      }
    }

    const nextStatus = req.body.status || existingClaim.status;
    const nextRejectionReason = req.body.rejectionReason !== undefined
      ? req.body.rejectionReason
      : existingClaim.rejectionReason;

    if (nextStatus === "REJECTED" && !nextRejectionReason?.trim()) {
      return res.status(400).json({
        success: false,
        message: "A rejection reason is required when status is REJECTED.",
      });
    }

    if (req.body.claimAmount !== undefined && Number.isNaN(Number(req.body.claimAmount))) {
      return res.status(400).json({ success: false, message: "claimAmount must be a valid number." });
    }

    const updatedClaim = await prisma.claim.update({
      where: {
        id,
      },
      data: {
        claimNumber: req.body.claimNumber,
        caseId: req.body.caseId,
        victimId: victimIdProvided ? nextVictimId : undefined,
        vehicleId: vehicleIdProvided ? nextVehicleId : undefined,
        claimantName: claimant.claimantName,
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

    if (error.code === "P2002") {
      return res.status(400).json({ success: false, message: "Claim Number already exists." });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update claim.",
    });
  }
};

/**
 * Delete Claim (soft delete -- matches Claim.deletedAt/deletedBy in schema)
 */
export const deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;

    const existingClaim = await prisma.claim.findUnique({
      where: { id },
    });

    if (!existingClaim || existingClaim.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Claim not found.",
      });
    }

    await prisma.claim.update({
      where: { id },
      data: { deletedAt: new Date(), deletedBy: req.user?.id || null },
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
    });
  }
};