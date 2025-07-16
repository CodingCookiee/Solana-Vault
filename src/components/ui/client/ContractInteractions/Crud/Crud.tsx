"use client";

import React, { useState } from "react";
import { useCrudService } from "@/services/crud";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Text,
} from "@/components/ui/common";

/**
 * CRUD Interface Component with Single PDA Architecture
 */
export const Crud: React.FC = () => {
  const {
    // Operations
    initializeUser,
    createEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,

    // State
    entries,
    loading,
    error,
    isWalletConnected,
    isInitialized,

    // Utility
    clearError,
  } = useCrudService();

  // Local state for forms
  const [createForm, setCreateForm] = useState({ title: "", message: "" });
  const [updateForm, setUpdateForm] = useState({ title: "", message: "" });
  const [deleteTitle, setDeleteTitle] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  // Individual loading states for each operation
  const [loadingStates, setLoadingStates] = useState({
    initialize: false,
    create: false,
    update: false,
    delete: false,
    refresh: false,
  });

  const setOperationLoading = (
    operation: keyof typeof loadingStates,
    isLoading: boolean
  ) => {
    setLoadingStates((prev) => ({ ...prev, [operation]: isLoading }));
  };

  const handleInitialize = async () => {
    setOperationLoading("initialize", true);
    const result = await initializeUser();
    setOperationLoading("initialize", false);

    if (result.success) {
      setStatus("User entries account initialized successfully!");
      setExplorerUrl(result.explorerUrl || null);
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.message.trim()) {
      setStatus("Please fill in both title and message");
      setExplorerUrl(null);
      return;
    }

    setOperationLoading("create", true);
    const result = await createEntry({
      title: createForm.title,
      message: createForm.message,
    });
    setOperationLoading("create", false);

    if (result.success) {
      setStatus("Entry created successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setCreateForm({ title: "", message: "" });
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.title.trim() || !updateForm.message.trim()) {
      setStatus("Please fill in both title and message");
      setExplorerUrl(null);
      return;
    }

    setOperationLoading("update", true);
    const result = await updateEntry({
      title: updateForm.title,
      message: updateForm.message,
    });
    setOperationLoading("update", false);

    if (result.success) {
      setStatus("Entry updated successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setUpdateForm({ title: "", message: "" });
      setSelectedEntry(null);
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTitle.trim()) {
      setStatus("Please enter a title to delete");
      setExplorerUrl(null);
      return;
    }

    setOperationLoading("delete", true);
    const result = await deleteEntry({ title: deleteTitle });
    setOperationLoading("delete", false);

    if (result.success) {
      setStatus("Entry deleted successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setDeleteTitle("");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
    }
  };

  const handleRefresh = async () => {
    setOperationLoading("refresh", true);
    await refreshEntries();
    setOperationLoading("refresh", false);
  };

  const handleEditEntry = (entry: any) => {
    setUpdateForm({ title: entry.title, message: entry.message });
    setSelectedEntry(entry.title);
  };

  const clearStatus = () => {
    setStatus("");
    setExplorerUrl(null);
    clearError();
  };

  // Check if any operation is loading
  const isAnyOperationLoading = Object.values(loadingStates).some(Boolean);

  if (!isWalletConnected) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle>
              <Text variant="h4" color="warning">
                Wallet Not Connected
              </Text>
            </CardTitle>
            <CardDescription>
              <Text color="warning">
                Please connect your wallet to use the CRUD features.
              </Text>
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Text variant="h1" className="mb-6">
        CRUD Interface
      </Text>

      {/* Initialization Status */}
      {!isInitialized && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardHeader>
            <CardTitle>
              <Text variant="h4" color="primary">
                Account Not Initialized
              </Text>
            </CardTitle>
            <CardDescription>
              <Text color="primary">
                You need to initialize your entries account before you can
                create, update, or delete entries.
              </Text>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleInitialize}
              disabled={loadingStates.initialize}
              className="bg-blue-500 hover:bg-blue-600"
            >
              {loadingStates.initialize
                ? "Initializing..."
                : "Initialize Account"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Error/Status Display */}
      {(error || status) && (
        <Card
          className={`mb-6 ${
            error || status.includes("Error")
              ? "bg-red-50 border-red-200"
              : "bg-green-50 border-green-200"
          }`}
        >
          <CardContent className="py-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <Text
                  color={
                    error || status.includes("Error") ? "error" : "success"
                  }
                >
                  {error || status}
                </Text>
                {explorerUrl && (
                  <div className="mt-2">
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      View Transaction on Explorer
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearStatus}
                className={`h-auto p-1 ${
                  error || status.includes("Error")
                    ? "text-red-500 hover:text-red-700"
                    : "text-green-500 hover:text-green-700"
                }`}
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {(loading || isAnyOperationLoading) && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="py-4">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <Text color="primary">Processing transaction...</Text>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Forms */}
        <div className="space-y-6">
          {/* Create Entry */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h4">Create Entry</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Text
                    variant="small"
                    weight="medium"
                    color="secondary"
                    className="block mb-2"
                  >
                    Title
                  </Text>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter title (max 50 characters)"
                    maxLength={50}
                    disabled={!isInitialized}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <Text
                    variant="small"
                    weight="medium"
                    color="secondary"
                    className="block mb-2"
                  >
                    Message
                  </Text>
                  <textarea
                    value={createForm.message}
                    onChange={(e) =>
                      setCreateForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Enter message (max 500 characters)"
                    maxLength={500}
                    rows={4}
                    disabled={!isInitialized}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={loadingStates.create || !isInitialized}
                  className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400"
                >
                  {loadingStates.create ? "Creating..." : "Create Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Update Entry */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h4">Update Entry</Text>
              </CardTitle>
              {selectedEntry && (
                <CardDescription>
                  <Text color="secondary">Editing: {selectedEntry}</Text>
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Text
                    variant="small"
                    weight="medium"
                    color="secondary"
                    className="block mb-2"
                  >
                    Title
                  </Text>
                  <input
                    type="text"
                    value={updateForm.title}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter title to update"
                    maxLength={50}
                    disabled={!isInitialized}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div>
                  <Text
                    variant="small"
                    weight="medium"
                    color="secondary"
                    className="block mb-2"
                  >
                    New Message
                  </Text>
                  <textarea
                    value={updateForm.message}
                    onChange={(e) =>
                      setUpdateForm((prev) => ({
                        ...prev,
                        message: e.target.value,
                      }))
                    }
                    placeholder="Enter new message"
                    maxLength={500}
                    rows={4}
                    disabled={!isInitialized}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={loadingStates.update || !isInitialized}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400"
                  >
                    {loadingStates.update ? "Updating..." : "Update Entry"}
                  </Button>
                  {selectedEntry && (
                    <Button
                      onClick={() => {
                        setSelectedEntry(null);
                        setUpdateForm({ title: "", message: "" });
                      }}
                      disabled={loadingStates.update || !isInitialized}
                      variant="secondary"
                      className="flex-1"
                    >
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delete Entry */}
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h4">Delete Entry</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Text
                    variant="small"
                    weight="medium"
                    color="secondary"
                    className="block mb-2"
                  >
                    Title
                  </Text>
                  <input
                    type="text"
                    value={deleteTitle}
                    onChange={(e) => setDeleteTitle(e.target.value)}
                    placeholder="Enter title to delete"
                    maxLength={50}
                    disabled={!isInitialized}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
                <Button
                  onClick={handleDelete}
                  disabled={loadingStates.delete || !isInitialized}
                  variant="destructive"
                  className="w-full disabled:bg-gray-400"
                >
                  {loadingStates.delete ? "Deleting..." : "Delete Entry"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Entries List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Text variant="h4">Your Entries</Text>
              </CardTitle>
              <CardDescription>
                <Text color="secondary">
                  {entries.length} {entries.length === 1 ? "entry" : "entries"}{" "}
                  found
                </Text>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Button
                  onClick={handleRefresh}
                  disabled={loadingStates.refresh || !isInitialized}
                  variant="secondary"
                  className="w-full disabled:bg-gray-400"
                >
                  {loadingStates.refresh ? "Refreshing..." : "Refresh Entries"}
                </Button>
              </div>

              {!isInitialized ? (
                <div className="text-center py-8">
                  <Text color="muted">
                    Please initialize your account first to view entries.
                  </Text>
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8">
                  <Text color="muted">
                    No entries found. Create your first entry using the form on
                    the left.
                  </Text>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {entries.map((entry, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <Text variant="h6" weight="semibold">
                              {entry.title}
                            </Text>
                            <div className="flex gap-1">
                              <Button
                                onClick={() => handleEditEntry(entry)}
                                disabled={
                                  isAnyOperationLoading || !isInitialized
                                }
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => setDeleteTitle(entry.title)}
                                disabled={
                                  isAnyOperationLoading || !isInitialized
                                }
                                size="sm"
                                variant="destructive"
                                className="text-xs"
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                          <Text color="secondary" className="break-words">
                            {entry.message}
                          </Text>
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <Text variant="small" color="muted">
                              Owner: {entry.owner.toBase58().slice(0, 8)}...
                              {entry.owner.toBase58().slice(-8)}
                            </Text>
                            {entry.created_at && (
                              <Text variant="small" color="muted">
                                Created:{" "}
                                {new Date(
                                  entry.created_at * 1000
                                ).toLocaleDateString()}
                              </Text>
                            )}
                          </div>
                          {entry.updated_at &&
                            entry.updated_at !== entry.created_at && (
                              <Text variant="small" color="muted">
                                Updated:{" "}
                                {new Date(
                                  entry.updated_at * 1000
                                ).toLocaleDateString()}
                              </Text>
                            )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Crud;
