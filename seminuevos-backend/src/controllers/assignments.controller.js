import { AssignmentsService } from "../services/assignments.service.js";

export async function listAllAssignments(req, res) {
  try {
    const data = await AssignmentsService.listAll(req); // <- pasar req
    res.json({ data });
  } catch (err) {
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}


export async function listAssignments(req, res) {
  try {
    const data = await AssignmentsService.list(req);
    res.json({ data });
  } catch (err) {
    console.error("Error listAssignments:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function getAssignment(req, res) {
  try {
    const data = await AssignmentsService.get(req);
    res.json({ data });
  } catch (err) {
    console.error("Error getAssignment:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function createAssignment(req, res) {
  try {
    const data = await AssignmentsService.create(req);
    res.status(201).json({ data });
  } catch (err) {
    console.error("Error createAssignment:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function updateAssignment(req, res) {
  try {
    const data = await AssignmentsService.update(req);
    res.json({ data });
  } catch (err) {
    console.error("Error updateAssignment:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}

export async function deleteAssignment(req, res) {
  try {
    const data = await AssignmentsService.remove(req);
    res.json({ data });
  } catch (err) {
    console.error("Error deleteAssignment:", err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
}
