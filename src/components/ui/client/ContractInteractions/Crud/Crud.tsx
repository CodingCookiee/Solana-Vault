"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import {
  Database,
  Plus,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Copy,
  ExternalLink,
  X,
  FileText,
  User,
  Calendar,
  Zap,
  Save,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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
  const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

  // Individual loading states for each operation
  const [loadingStates, setLoadingStates] = useState({
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const formatAddress = (address: string) => {
    if (address.length < 8) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const handleCreate = async () => {
    if (!createForm.title.trim() || !createForm.message.trim()) {
      setStatus("Please fill in both title and message");
      setExplorerUrl(null);
      toast.error("Please fill in all required fields");
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
      toast.success("Entry created successfully!");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
      toast.error(`Failed to create entry: ${result.error}`);
    }
  };

  const handleUpdate = async () => {
    if (!updateForm.title.trim() || !updateForm.message.trim()) {
      setStatus("Please fill in both title and message");
      setExplorerUrl(null);
      toast.error("Please fill in all required fields");
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
      toast.success("Entry updated successfully!");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
      toast.error(`Failed to update entry: ${result.error}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteTitle.trim()) {
      setStatus("Please enter a title to delete");
      setExplorerUrl(null);
      toast.error("Please enter a title to delete");
      return;
    }

    setOperationLoading("delete", true);
    const result = await deleteEntry({ title: deleteTitle });
    setOperationLoading("delete", false);

    if (result.success) {
      setStatus("Entry deleted successfully!");
      setExplorerUrl(result.explorerUrl || null);
      setDeleteTitle("");
      toast.success("Entry deleted successfully!");
    } else {
      setStatus(`Error: ${result.error}`);
      setExplorerUrl(null);
      toast.error(`Failed to delete entry: ${result.error}`);
    }
  };

  const handleRefresh = async () => {
    setOperationLoading("refresh", true);
    await refreshEntries();
    setOperationLoading("refresh", false);
    toast.success("Entries refreshed!");
  };

  const handleEditEntry = (entry: any) => {
    setUpdateForm({ title: entry.title, message: entry.message });
    setSelectedEntry(entry.title);
    toast.info("Entry loaded for editing");
  };

  const clearStatus = () => {
    setStatus("");
    setExplorerUrl(null);
    clearError();
  };

  // Check if any operation is loading
  const isAnyOperationLoading = Object.values(loadingStates).some(Boolean);

  // Character count helpers
  const getTitleCharCount = (form: "create" | "update" | "delete") => {
    switch (form) {
      case "create":
        return createForm.title.length;
      case "update":
        return updateForm.title.length;
      case "delete":
        return deleteTitle.length;
      default:
        return 0;
    }
  };

  const getMessageCharCount = (form: "create" | "update") => {
    return form === "create"
      ? createForm.message.length
      : updateForm.message.length;
  };

  if (!isWalletConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="border border-amber-200 dark:border-amber-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
          <CardContent className="p-8 text-center">
            <div className="relative mx-auto w-fit mb-4">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 opacity-20 blur"></div>
              <div className="relative p-3 bg-amber-100/50 dark:bg-amber-900/30 rounded-full">
                <AlertCircle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <Text
              variant="h3"
              className="mb-2 text-amber-800 dark:text-amber-200 font-bold"
            >
              Wallet Not Connected
            </Text>
            <Text variant="body" color="muted">
              Please connect your wallet to use the CRUD features and interact
              with the blockchain.
            </Text>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto space-y-6"
    >
      {/* Back to Dashboard */}
      <div className="flex justify-between items-center">
        <Link href="/dashboard">
          <Button
            // onClick={() => window.history.back()}
            variant="outline"
            className="mb-4 text-sm font-medium flex items-center gap-2  border-green-200 text-green-600 hover:bg-green-50 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-3"
      >
        <div className="relative mx-auto w-fit">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 opacity-20 blur"></div>
          <div className="relative p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full shadow-lg">
            <Database className="h-8 w-8 text-white" />
          </div>
        </div>

        <div>
          <Text
            variant="h2"
            className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent font-bold"
          >
            CRUD Interface
          </Text>
          <Text variant="body" color="muted" className="max-w-2xl mx-auto">
            Create, Read, Update, and Delete entries on the Solana blockchain
          </Text>
        </div>
      </motion.div>

      {/* Status/Error Display */}
      <AnimatePresence>
        {(error || status) && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`overflow-hidden ${
                error || status.includes("Error")
                  ? "border-red-200 dark:border-red-800"
                  : "border-green-200 dark:border-green-800"
              }`}
            >
              <div
                className={`h-1 ${
                  error || status.includes("Error")
                    ? "bg-gradient-to-r from-red-400 to-pink-400"
                    : "bg-gradient-to-r from-green-400 to-emerald-400"
                }`}
              ></div>

              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div
                    className={`p-1.5 rounded-full mt-0.5 ${
                      error || status.includes("Error")
                        ? "bg-red-100 dark:bg-red-900/30"
                        : "bg-green-100 dark:bg-green-900/30"
                    }`}
                  >
                    {error || status.includes("Error") ? (
                      <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <Text
                      variant="small"
                      weight="medium"
                      className={
                        error || status.includes("Error")
                          ? "text-red-800 dark:text-red-200"
                          : "text-green-800 dark:text-green-200"
                      }
                    >
                      {error || status.includes("Error")
                        ? "Operation Failed"
                        : "Operation Successful"}
                    </Text>

                    <Text variant="extraSmall" color="muted">
                      {error || status}
                    </Text>

                    {explorerUrl && (
                      <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <Text variant="extraSmall" color="muted">
                          Transaction:
                        </Text>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(explorerUrl)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(explorerUrl, "_blank")}
                          className="h-6 w-6 p-0"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearStatus}
                    className="h-6 w-6 p-0 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Indicator */}
      <AnimatePresence>
        {(loading || isAnyOperationLoading) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-blue-200 dark:border-blue-800 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-400 to-purple-400"></div>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin" />
                  </div>
                  <Text
                    variant="small"
                    className="text-blue-800 dark:text-blue-200"
                  >
                    Processing blockchain transaction...
                  </Text>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6">
        {/* Left Column - Create Entry */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 shadow-sm">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h5"
                      className="text-green-600 dark:text-green-400 font-bold"
                    >
                      Create Entry
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Add a new entry to the blockchain
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium">
                      Title
                    </Text>
                  </label>
                  <Text
                    variant="extraSmall"
                    color={
                      getTitleCharCount("create") > 40 ? "warning" : "muted"
                    }
                  >
                    {getTitleCharCount("create")}/50
                  </Text>
                </div>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter title..."
                  maxLength={50}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium">
                      Message
                    </Text>
                  </label>
                  <Text
                    variant="extraSmall"
                    color={
                      getMessageCharCount("create") > 400 ? "warning" : "muted"
                    }
                  >
                    {getMessageCharCount("create")}/500
                  </Text>
                </div>
                <textarea
                  value={createForm.message}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Enter your message..."
                  maxLength={500}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 transition-colors resize-none"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={
                  loadingStates.create ||
                  !createForm.title.trim() ||
                  !createForm.message.trim()
                }
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg group border-0"
                size="lg"
              >
                {loadingStates.create ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating...</span>
                  </div>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    <span>Create Entry</span>
                    <ArrowRight className="h-4 w-4 ml-2 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Middle Column - Update/Delete */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Update Entry */}
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 shadow-sm">
                  <Edit3 className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle>
                    <Text
                      variant="h5"
                      className="text-blue-600 dark:text-blue-400 font-bold"
                    >
                      Update Entry
                    </Text>
                  </CardTitle>
                  {selectedEntry ? (
                    <Text
                      variant="small"
                      className="text-blue-700 dark:text-blue-300"
                    >
                      Editing: {selectedEntry}
                    </Text>
                  ) : (
                    <Text variant="small" color="muted">
                      Modify an existing entry
                    </Text>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium">
                      Title
                    </Text>
                  </label>
                  <Text
                    variant="extraSmall"
                    color={
                      getTitleCharCount("update") > 40 ? "warning" : "muted"
                    }
                  >
                    {getTitleCharCount("update")}/50
                  </Text>
                </div>
                <input
                  type="text"
                  value={updateForm.title}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Enter title to update..."
                  maxLength={50}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium">
                      New Message
                    </Text>
                  </label>
                  <Text
                    variant="extraSmall"
                    color={
                      getMessageCharCount("update") > 400 ? "warning" : "muted"
                    }
                  >
                    {getMessageCharCount("update")}/500
                  </Text>
                </div>
                <textarea
                  value={updateForm.message}
                  onChange={(e) =>
                    setUpdateForm((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }))
                  }
                  placeholder="Enter new message..."
                  maxLength={500}
                  rows={3}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 transition-colors resize-none"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpdate}
                  disabled={
                    loadingStates.update ||
                    !updateForm.title.trim() ||
                    !updateForm.message.trim()
                  }
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 shadow-lg border-0"
                >
                  {loadingStates.update ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      <span>Update</span>
                    </>
                  )}
                </Button>
                {selectedEntry && (
                  <Button
                    onClick={() => {
                      setSelectedEntry(null);
                      setUpdateForm({ title: "", message: "" });
                    }}
                    disabled={loadingStates.update}
                    variant="outline"
                    className="flex-1"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Delete Entry */}
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-red-500 to-pink-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 shadow-sm">
                  <Trash2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle>
                    <Text
                      variant="h5"
                      className="text-red-600 dark:text-red-400 font-bold"
                    >
                      Delete Entry
                    </Text>
                  </CardTitle>
                  <CardDescription>
                    <Text variant="small" color="muted">
                      Permanently remove an entry
                    </Text>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block">
                    <Text variant="small" weight="medium">
                      Title to Delete
                    </Text>
                  </label>
                  <Text
                    variant="extraSmall"
                    color={
                      getTitleCharCount("delete") > 40 ? "warning" : "muted"
                    }
                  >
                    {getTitleCharCount("delete")}/50
                  </Text>
                </div>
                <input
                  type="text"
                  value={deleteTitle}
                  onChange={(e) => setDeleteTitle(e.target.value)}
                  placeholder="Enter title to delete..."
                  maxLength={50}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 dark:bg-gray-800 transition-colors"
                />
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <Text
                    variant="extraSmall"
                    className="text-red-800 dark:text-red-200"
                  >
                    This action cannot be undone
                  </Text>
                </div>
              </div>

              <Button
                onClick={handleDelete}
                disabled={loadingStates.delete || !deleteTitle.trim()}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg border-0"
              >
                {loadingStates.delete ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </div>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete Entry</span>
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Entries List */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="border border-white/20 dark:border-gray-800/20 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>

            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 shadow-sm">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>
                      <Text
                        variant="h5"
                        className="text-purple-600 dark:text-purple-400 font-bold"
                      >
                        Your Entries
                      </Text>
                    </CardTitle>
                    <Text variant="small" color="muted">
                      {entries.length}{" "}
                      {entries.length === 1 ? "entry" : "entries"} found
                    </Text>
                  </div>
                </div>

                <Button
                  onClick={handleRefresh}
                  disabled={loadingStates.refresh}
                  variant="outline"
                  size="sm"
                  className="border-purple-200 text-purple-600 hover:bg-purple-50 dark:border-purple-700 dark:text-purple-400 dark:hover:bg-purple-900/20"
                >
                  {loadingStates.refresh ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              <AnimatePresence>
                {entries.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="relative mx-auto w-fit mb-4">
                      <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 opacity-20 blur"></div>
                      <div className="relative p-3 bg-gray-100 dark:bg-gray-800 rounded-full">
                        <FileText className="h-6 w-6 text-gray-500" />
                      </div>
                    </div>
                    <Text variant="body" color="muted" className="mb-2">
                      No entries found
                    </Text>
                    <Text variant="small" color="muted">
                      Create your first entry using the form on the left
                    </Text>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-3 max-h-96 overflow-y-auto"
                  >
                    {entries.map((entry, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <Card className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <Text
                                    variant="body"
                                    weight="semibold"
                                    className="truncate pr-2"
                                  >
                                    {entry.title}
                                  </Text>
                                  <Text
                                    variant="small"
                                    color="muted"
                                    className="break-words mt-1"
                                  >
                                    {entry.message}
                                  </Text>
                                </div>
                                <div className="flex gap-1 shrink-0">
                                  <Button
                                    onClick={() => handleEditEntry(entry)}
                                    disabled={isAnyOperationLoading}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                                  >
                                    <Edit3 className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    onClick={() => setDeleteTitle(entry.title)}
                                    disabled={isAnyOperationLoading}
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs border-red-200 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
                                <div className="flex items-center space-x-2">
                                  <User className="h-3 w-3 text-gray-500" />
                                  <Text
                                    variant="extraSmall"
                                    color="muted"
                                    className="font-mono"
                                  >
                                    {formatAddress(entry.owner.toBase58())}
                                  </Text>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    copyToClipboard(entry.owner.toBase58())
                                  }
                                  className="h-6 w-6 p-0"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Crud;
