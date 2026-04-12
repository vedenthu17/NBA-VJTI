import { useParams, useSearchParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useFacultyProfile } from "../hooks/useFaculty";
import FacultyProfile from "../components/FacultyProfile";
import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { adminApi, entryApi, facultyApi, notificationApi } from "../api/facultyApi";

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  if (/^https?:\/\//i.test(text)) return text;
  return `https://${text}`;
}

function normalizeEntryPayload(body = {}) {
  const payload = { ...body };
  const urlKeys = ["reference_url", "pdf_url", "proof_url"];
  for (const key of urlKeys) {
    if (key in payload) {
      payload[key] = normalizeUrl(payload[key]);
    }
  }

  const intKeys = ["year", "start_year", "end_year"];
  for (const key of intKeys) {
    if (key in payload) {
      const raw = payload[key];
      if (raw === "" || raw === null || raw === undefined) {
        delete payload[key];
        continue;
      }
      const parsed = Number(raw);
      if (Number.isFinite(parsed)) {
        payload[key] = Math.trunc(parsed);
      } else {
        delete payload[key];
      }
    }
  }

  if ("amount" in payload) {
    const parsed = Number(payload.amount);
    payload.amount = Number.isFinite(parsed) ? parsed : 0;
  }

  return payload;
}

export default function FacultyProfilePage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { token, role, user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const { data, isLoading, error } = useFacultyProfile(id, token);

  const isOwnerById = Boolean(data?.faculty?.user_id && user?.id && data.faculty.user_id === user.id);
  const isOwnerByEmail = Boolean(
    data?.faculty?.email &&
      user?.email &&
      data.faculty.email.toLowerCase().trim() === user.email.toLowerCase().trim(),
  );

  const viewerPreview = searchParams.get("preview") === "viewer";
  const reviewPreview = searchParams.get("preview") === "review";
  const reviewTable = searchParams.get("table") || "";
  const reviewRequestId = searchParams.get("request") || "";
  const reviewLabel = searchParams.get("label") || "Selected request";

  const canManage =
    !viewerPreview &&
    !reviewPreview &&
    Boolean(token && role !== "viewer" && data?.faculty && (role === "admin" || isOwnerById || isOwnerByEmail));

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.list(token),
    enabled: Boolean(token && canManage),
  });

  const rejectionRemarks = notifications
    .filter((n) => /rejected/i.test(String(n.title || "")))
    .map((n) => {
      const text = String(n.message || "");
      const marker = "Remarks:";
      const index = text.indexOf(marker);
      const remark = index >= 0 ? text.slice(index + marker.length).trim() : "";
      if (!remark) return null;
      return {
        id: n.id,
        title: n.title,
        remark,
        createdAt: n.created_at,
      };
    })
    .filter(Boolean);

  const createEntry = useMutation({
    mutationFn: ({ table, body }) => entryApi.create(table, { ...normalizeEntryPayload(body), faculty_id: id }, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      setMessage("Saved successfully. Entry is pending admin approval.");
    },
    onError: (err) => setMessage(err.message || "Unable to save entry."),
  });

  const updateEntry = useMutation({
    mutationFn: ({ table, rowId, body }) => entryApi.update(table, rowId, normalizeEntryPayload(body), token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      setMessage("Updated successfully. Changes are pending admin approval.");
    },
    onError: (err) => setMessage(err.message || "Unable to update entry."),
  });

  const updateFaculty = useMutation({
    mutationFn: (body) => facultyApi.update(id, body, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      setMessage("Profile updated. It will be visible to viewers after admin approval.");
    },
    onError: (err) => setMessage(err.message || "Unable to update profile."),
  });

  const handleCreateEntry = async (table, body) => {
    if (!canManage) {
      setMessage("You do not have permission to edit this profile. Please login with the correct faculty/admin account.");
      return;
    }
    await createEntry.mutateAsync({ table, body });
  };

  const handleUpdateFaculty = async (body) => {
    if (!canManage) {
      setMessage("You do not have permission to edit this profile. Please login with the correct faculty/admin account.");
      return;
    }
    await updateFaculty.mutateAsync(body);
  };

  const handleUpdateEntry = async (table, rowId, body) => {
    if (!canManage) {
      setMessage("You do not have permission to edit this profile. Please login with the correct faculty/admin account.");
      return;
    }
    await updateEntry.mutateAsync({ table, rowId, body });
  };

  const handleUploadPhoto = async (imageBase64, fileName) => {
    if (!canManage) return;
    try {
      const response = await facultyApi.uploadPhoto(id, { image_base64: imageBase64, file_name: fileName }, token);
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["faculty"] });
      setMessage(response?.photo_url ? "Photo uploaded successfully." : "Photo updated.");
    } catch (err) {
      setMessage(err.message || "Unable to upload photo.");
    }
  };

  const approveReview = useMutation({
    mutationFn: () => adminApi.approve(reviewTable, reviewRequestId, token),
    onSuccess: () => {
      setMessage("Approved successfully from review page.");
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["pending"] });
      queryClient.invalidateQueries({ queryKey: ["approval-history"] });
    },
    onError: (err) => setMessage(err.message || "Unable to approve this request."),
  });

  const rejectReview = useMutation({
    mutationFn: ({ remark }) => adminApi.reject(reviewTable, reviewRequestId, token, { remark }),
    onSuccess: () => {
      setMessage("Rejected successfully from review page.");
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["pending"] });
      queryClient.invalidateQueries({ queryKey: ["approval-history"] });
    },
    onError: (err) => setMessage(err.message || "Unable to reject this request."),
  });

  const removeReview = useMutation({
    mutationFn: () => adminApi.removeDetail(reviewTable, reviewRequestId, token),
    onSuccess: () => {
      setMessage("Removed successfully from review page.");
      queryClient.invalidateQueries({ queryKey: ["faculty", id] });
      queryClient.invalidateQueries({ queryKey: ["pending"] });
      queryClient.invalidateQueries({ queryKey: ["approval-history"] });
    },
    onError: (err) => setMessage(err.message || "Unable to remove this request."),
  });

  const submitReviewReject = (remark) => {
    rejectReview.mutate({ remark: remark.trim() });
    setRejectDialogOpen(false);
    setRejectRemark("");
  };

  if (isLoading) return <p className="px-4 py-10">Loading profile...</p>;
  if (error) return <p className="px-4 py-10 text-rose-600">{error.message}</p>;

  return (
    <DashboardLayout>
      {reviewPreview && role === "admin" && reviewTable && reviewRequestId && (
        <section className="mb-4 rounded border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-xs font-semibold uppercase text-blue-700">Admin Review Mode</p>
          <h2 className="text-lg font-bold text-slate-800">{reviewLabel}</h2>
          <p className="text-sm text-slate-600">Request Type: {reviewTable}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => approveReview.mutate()}
              disabled={approveReview.isPending || rejectReview.isPending || removeReview.isPending}
            >
              Approve This Change
            </button>
            <button
              className="rounded bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
              onClick={() => setRejectDialogOpen(true)}
              disabled={approveReview.isPending || rejectReview.isPending || removeReview.isPending}
            >
              Reject This Change
            </button>
            <button
              className="rounded border border-slate-400 px-3 py-2 text-sm font-semibold text-slate-700"
              onClick={() => removeReview.mutate()}
              disabled={approveReview.isPending || rejectReview.isPending || removeReview.isPending}
            >
              Remove This Change
            </button>
          </div>
        </section>
      )}

      {rejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={() => setRejectDialogOpen(false)}>
          <div className="w-full max-w-lg rounded-xl border border-slate-300 bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-800">Reject This Change</h3>
            <p className="mt-1 text-sm text-slate-600">Remark is optional. Leave it empty if you only want to reject.</p>
            <textarea
              rows={4}
              maxLength={500}
              value={rejectRemark}
              onChange={(event) => setRejectRemark(event.target.value)}
              className="mt-3 w-full rounded border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-rose-400 focus:outline-none"
              placeholder="Optional remark (max 500 characters)"
            />
            <p className="mt-1 text-right text-xs text-slate-500">{rejectRemark.length}/500</p>
            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="rounded border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                onClick={() => setRejectDialogOpen(false)}
                disabled={rejectReview.isPending}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded border border-rose-300 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700"
                onClick={() => submitReviewReject("")}
                disabled={rejectReview.isPending}
              >
                Reject Without Remark
              </button>
              <button
                type="button"
                className="rounded bg-rose-600 px-3 py-2 text-sm font-semibold text-white"
                onClick={() => submitReviewReject(rejectRemark)}
                disabled={rejectReview.isPending}
              >
                {rejectReview.isPending ? "Rejecting..." : "Reject and Send Remark"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FacultyProfile
        data={data}
        canManage={canManage}
        onCreateEntry={handleCreateEntry}
        onUpdateEntry={handleUpdateEntry}
        onUpdateFaculty={handleUpdateFaculty}
        onUploadPhoto={handleUploadPhoto}
        message={message}
        rejectionRemarks={rejectionRemarks}
        busy={createEntry.isPending || updateEntry.isPending || updateFaculty.isPending}
      />
    </DashboardLayout>
  );
}
