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
 * CRUD Interface Component
 */
export const Crud: React.FC = () => {
  const {
    // Operations
    createEntry,
    updateEntry,
    deleteEntry,
    refreshEntries,

    // State
    entries,
    loading,
    error,
    isWalletConnected,

    // Utility
    clearError,
  } = useCrudService();

  // Local state for forms
  const [createForm, setCreateForm] = useState({ title: "", message: "" });
  const [updateForm, setUpdateForm] = useState({ title: "", message: "" });
  const [deleteTitle, setDeleteTitle] = useState("");
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);
  const [status, setStatus] = useState("");

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.message.trim()) {
      setStatus("Please fill in both title and message");
      return;
    }

    const result = await createEntry({
      title: createForm.title,
      message: createForm.message,
    });

    if (result.success) {
      setStatus("Entry created successfully!");
      setCreateForm({ title: "", message: "" });
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.title.trim() || !updateForm.message.trim()) {
      setStatus("Please fill in both title and message");
      return;
    }

    const result = await updateEntry({
      title: updateForm.title,
      message: updateForm.message,
    });

    if (result.success) {
      setStatus("Entry updated successfully!");
      setUpdateForm({ title: "", message: "" });
      setSelectedEntry(null);
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTitle.trim()) {
      setStatus("Please enter a title to delete");
      return;
    }

    const result = await deleteEntry({ title: deleteTitle });

    if (result.success) {
      setStatus("Entry deleted successfully!");
      setDeleteTitle("");
    } else {
      setStatus(`Error: ${result.error}`);
    }
  };

  const handleEditEntry = (entry: any) => {
    setUpdateForm({ title: entry.title, message: entry.message });
    setSelectedEntry(entry.title);
  };

  const clearStatus = () => {
    setStatus("");
    clearError();
  };

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

      {/* Error/Status Display */}
      {(error || status) && (
        <Card className="bg-red-50 border-red-200 mb-6">
          <CardContent className="py-4">
            <div className="flex justify-between items-center">
              <Text color="error">{error || status}</Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearStatus}
                className="text-red-500 hover:text-red-700 h-auto p-1"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading Indicator */}
      {loading && (
        <Card className="bg-blue-50 border-blue-200 mb-6">
          <CardContent className="py-4">
            <Text color="primary">Processing...</Text>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button
                  onClick={handleCreate}
                  disabled={loading}
                  className="w-full bg-green-500 hover:bg-green-600"
                >
                  Create Entry
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={loading}
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                  >
                    Update Entry
                  </Button>
                  {selectedEntry && (
                    <Button
                      onClick={() => {
                        setSelectedEntry(null);
                        setUpdateForm({ title: "", message: "" });
                      }}
                      disabled={loading}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <Button
                  onClick={handleDelete}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  Delete Entry
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
                  onClick={refreshEntries}
                  disabled={loading}
                  variant="secondary"
                  className="w-full"
                >
                  Refresh Entries
                </Button>
              </div>

              {entries.length === 0 ? (
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
                                disabled={loading}
                                size="sm"
                                variant="outline"
                                className="text-xs"
                              >
                                Edit
                              </Button>
                              <Button
                                onClick={() => setDeleteTitle(entry.title)}
                                disabled={loading}
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
                          <Text variant="small" color="muted">
                            Owner: {entry.owner.toBase58().slice(0, 8)}...
                            {entry.owner.toBase58().slice(-8)}
                          </Text>
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
