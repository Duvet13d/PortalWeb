import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Notes Tool - Full-featured note-taking with markdown support for the Tools page
 */
const Notes = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState("");
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(true);

  const textareaRef = useRef(null);
  const autoSaveRef = useRef(null);

  // Load notes from localStorage on mount
  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem("homepage-notes");
      const savedSettings = localStorage.getItem("notes-settings");

      if (savedNotes) {
        const parsedNotes = JSON.parse(savedNotes);
        setNotes(parsedNotes);
        if (parsedNotes.length > 0) {
          setSelectedNoteId(parsedNotes[0].id);
          setCurrentNote(parsedNotes[0].content);
        }
      }

      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        setAutoSave(settings.autoSave !== false);
        setShowToolbar(settings.showToolbar !== false);
      }
    } catch (error) {
      console.error("Failed to load notes:", error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback(() => {
    try {
      const settings = { autoSave, showToolbar };
      localStorage.setItem("notes-settings", JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [autoSave, showToolbar]);

  // Save settings when they change
  useEffect(() => {
    saveSettings();
  }, [saveSettings]);

  // Auto-save functionality
  const saveNotes = useCallback(
    async (notesToSave) => {
      if (!autoSave) return;

      setIsSaving(true);
      try {
        localStorage.setItem("homepage-notes", JSON.stringify(notesToSave));
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save notes:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [autoSave]
  );

  // Debounced auto-save
  useEffect(() => {
    if (autoSaveRef.current) {
      clearTimeout(autoSaveRef.current);
    }

    autoSaveRef.current = setTimeout(() => {
      if (notes.length > 0) {
        saveNotes(notes);
      }
    }, 1000); // Save after 1 second of inactivity

    return () => {
      if (autoSaveRef.current) {
        clearTimeout(autoSaveRef.current);
      }
    };
  }, [notes, saveNotes]);

  // Create new note
  const createNewNote = () => {
    const newNote = {
      id: Date.now().toString(),
      title: "New Note",
      content: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    setNotes(updatedNotes);
    setSelectedNoteId(newNote.id);
    setCurrentNote("");

    // Focus textarea after creating note
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  };

  // Update current note content
  const updateCurrentNote = (content) => {
    setCurrentNote(content);

    if (selectedNoteId) {
      const updatedNotes = notes.map((note) => {
        if (note.id === selectedNoteId) {
          const title = extractTitle(content) || "Untitled Note";
          return {
            ...note,
            title,
            content,
            updatedAt: new Date().toISOString(),
          };
        }
        return note;
      });
      setNotes(updatedNotes);
    }
  };

  // Extract title from content (first line or first few words)
  const extractTitle = (content) => {
    if (!content.trim()) return "";

    const firstLine = content.split("\n")[0].trim();
    // Remove markdown formatting for title
    const cleanTitle = firstLine
      .replace(/^#+\s*/, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");

    return cleanTitle.length > 50
      ? cleanTitle.substring(0, 50) + "..."
      : cleanTitle;
  };

  // Select note
  const selectNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId);
    if (note) {
      setSelectedNoteId(noteId);
      setCurrentNote(note.content);
    }
  };

  // Delete note
  const deleteNote = (noteId) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId);
    setNotes(updatedNotes);

    if (selectedNoteId === noteId) {
      if (updatedNotes.length > 0) {
        setSelectedNoteId(updatedNotes[0].id);
        setCurrentNote(updatedNotes[0].content);
      } else {
        setSelectedNoteId(null);
        setCurrentNote("");
      }
    }
  };

  // Search notes
  const filteredNotes = notes.filter(
    (note) =>
      !searchQuery ||
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Insert markdown formatting
  const insertMarkdown = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = currentNote.substring(start, end);

    let newText = "";
    let cursorOffset = 0;

    switch (format) {
      case "bold":
        newText = `**${selectedText}**`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case "italic":
        newText = `*${selectedText}*`;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case "heading":
        newText = `## ${selectedText}`;
        cursorOffset = selectedText ? 0 : 3;
        break;
      case "list":
        newText = `- ${selectedText}`;
        cursorOffset = selectedText ? 0 : 2;
        break;
      case "code":
        newText = `\`${selectedText}\``;
        cursorOffset = selectedText ? 0 : 1;
        break;
      case "link":
        newText = `[${selectedText}](url)`;
        cursorOffset = selectedText ? -4 : -5;
        break;
      default:
        return;
    }

    const newContent =
      currentNote.substring(0, start) + newText + currentNote.substring(end);
    updateCurrentNote(newContent);

    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + newText.length + cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  // Render markdown preview (basic implementation)
  const renderMarkdownPreview = (content) => {
    return content
      .replace(
        /^# (.*$)/gm,
        '<h1 class="text-2xl font-bold text-white mb-4">$1</h1>'
      )
      .replace(
        /^## (.*$)/gm,
        '<h2 class="text-xl font-semibold text-white mb-3">$1</h2>'
      )
      .replace(
        /^### (.*$)/gm,
        '<h3 class="text-lg font-medium text-white mb-2">$1</h3>'
      )
      .replace(
        /\*\*(.*?)\*\*/g,
        '<strong class="font-semibold text-white">$1</strong>'
      )
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-300">$1</em>')
      .replace(
        /`(.*?)`/g,
        '<code class="bg-gray-800 px-2 py-1 rounded text-accent-1 font-mono text-sm">$1</code>'
      )
      .replace(/^- (.*$)/gm, '<li class="text-gray-300 ml-4 mb-1">• $1</li>')
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-accent-1 hover:text-accent-2 underline" target="_blank">$1</a>'
      )
      .replace(/\n/g, "<br>");
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-900/50 border border-gray-700 rounded-xl p-6 backdrop-blur-sm w-full max-w-7xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-accent-1">
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              className="w-full h-full"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Notes</h2>
            <p className="text-gray-400">
              {notes.length} {notes.length === 1 ? "note" : "notes"}
              {lastSaved && (
                <span className="ml-2">• Saved {formatDate(lastSaved)}</span>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isSaving && (
            <div className="w-5 h-5 border-2 border-accent-1/30 border-t-accent-1 rounded-full animate-spin" />
          )}
          <button
            onClick={() => setShowSearch(!showSearch)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Search notes"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Settings"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all duration-300"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex gap-6 h-[600px]">
        {/* Notes List */}
        <div className="w-80 border-r border-gray-700 pr-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-white">All Notes</h3>
            <button
              onClick={createNewNote}
              className="px-3 py-1 bg-accent-1 hover:bg-accent-2 text-white text-sm rounded transition-colors"
            >
              New Note
            </button>
          </div>

          <div className="space-y-3 overflow-y-auto h-full">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-4">
                  {searchQuery ? "No notes found" : "No notes yet"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={createNewNote}
                    className="text-accent-1 hover:text-accent-2 transition-colors"
                  >
                    Create your first note
                  </button>
                )}
              </div>
            ) : (
              filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => selectNote(note.id)}
                  className={`p-4 rounded-lg cursor-pointer transition-colors group ${
                    selectedNoteId === note.id
                      ? "bg-accent-1/20 border border-accent-1/30"
                      : "bg-gray-800/30 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate mb-1">
                        {note.title}
                      </h4>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {note.content
                          .replace(/[#*`\[\]]/g, "")
                          .substring(0, 80)}
                        {note.content.length > 80 ? "..." : ""}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formatDate(note.updatedAt)}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNote(note.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-red-400 hover:text-red-300 transition-all ml-2"
                      title="Delete note"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Note Editor */}
        <div className="flex-1 flex flex-col">
          {/* Formatting Toolbar */}
          {showToolbar && (
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => insertMarkdown("bold")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="Bold"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => insertMarkdown("italic")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="Italic"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 4l4 16M6 8h12M4 16h12"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => insertMarkdown("heading")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="Heading"
                >
                  <span className="text-lg font-bold">H</span>
                </button>
                <button
                  onClick={() => insertMarkdown("list")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="List"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => insertMarkdown("code")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="Code"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => insertMarkdown("link")}
                  className="p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded transition-colors"
                  title="Link"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>
              </div>

              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1 rounded transition-colors ${
                  previewMode
                    ? "bg-accent-1 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                {previewMode ? "Edit" : "Preview"}
              </button>
            </div>
          )}

          {/* Editor/Preview */}
          {previewMode ? (
            <div
              className="flex-1 p-6 bg-gray-800/30 rounded-lg overflow-y-auto text-gray-300 leading-relaxed prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownPreview(currentNote),
              }}
            />
          ) : (
            <textarea
              ref={textareaRef}
              value={currentNote}
              onChange={(e) => updateCurrentNote(e.target.value)}
              placeholder={
                selectedNoteId
                  ? "Start writing your note... Use markdown for formatting!"
                  : "Create a new note to get started"
              }
              className="flex-1 w-full p-6 bg-gray-800/30 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent-1 focus:ring-2 focus:ring-accent-1/20 transition-all duration-300 resize-none font-mono text-sm leading-relaxed"
              disabled={!selectedNoteId}
            />
          )}

          {/* Markdown Help */}
          <div className="mt-4 text-xs text-gray-500">
            <details className="cursor-pointer">
              <summary className="hover:text-gray-400 transition-colors">
                Markdown formatting help
              </summary>
              <div className="mt-3 grid grid-cols-3 gap-4 p-4 bg-gray-800/30 rounded-lg">
                <div>
                  <code>**bold**</code> → <strong>bold</strong>
                </div>
                <div>
                  <code>*italic*</code> → <em>italic</em>
                </div>
                <div>
                  <code>## heading</code> → heading
                </div>
                <div>
                  <code>- list item</code> → • list item
                </div>
                <div>
                  <code>`code`</code> → <code>code</code>
                </div>
                <div>
                  <code>[link](url)</code> → link
                </div>
              </div>
            </details>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-gray-700"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={autoSave}
                      onChange={(e) => setAutoSave(e.target.checked)}
                      className="w-4 h-4 text-accent-1 bg-gray-700 border-gray-600 rounded focus:ring-accent-1 focus:ring-2"
                    />
                    <span className="text-sm text-gray-400">
                      Auto-save notes
                    </span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={showToolbar}
                      onChange={(e) => setShowToolbar(e.target.checked)}
                      className="w-4 h-4 text-accent-1 bg-gray-700 border-gray-600 rounded focus:ring-accent-1 focus:ring-2"
                    />
                    <span className="text-sm text-gray-400">
                      Show formatting toolbar
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Notes;
