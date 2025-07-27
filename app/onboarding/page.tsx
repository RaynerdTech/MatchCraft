"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getSession } from "next-auth/react";
import type { Variants } from "framer-motion";
import imageCompression from "browser-image-compression";

// Constants for dropdown options
const skillOptions = ["beginner", "intermediate", "advanced"];
const positionOptions = ["goalkeeper", "defender", "midfielder", "forward"];
const roleOptions = ["player", "organizer"];

// Animation variants for consistent motion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
    },
  },
};

const buttonVariants = {
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 20px rgba(0, 0, 255, 0.2)",
    transition: {
      duration: 0.3,
      yoyo: Infinity,
    },
  },
  tap: {
    scale: 0.98,
  },
};

// Image validation function
const validateImage = (base64: string) => {
  if (!base64) return "Image is required";
  if (!base64.startsWith("data:image/")) {
    return "Invalid image format. Please upload a valid image file (JPEG, PNG)";
  }

  const base64Length = base64.length - "data:image/png;base64,".length;
  const sizeInBytes = 4 * Math.ceil(base64Length / 3) * 0.5624896334383812;

  if (sizeInBytes > 2 * 1024 * 1024) {
    return "Image must be smaller than 2MB after compression";
  }

  return null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    phone: "",
    skillLevel: "",
    position: "",
    role: "",
    imageBase64: "",
  });
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formValid, setFormValid] = useState(false);
  const [compressionInProgress, setCompressionInProgress] = useState(false);

  // Check for authenticated session
  useEffect(() => {
    getSession().then((session) => {
      if (!session) router.push("/signin");
    });
  }, [router]);

  // Validate form
  useEffect(() => {
    const isValid =
      form.phone &&
      form.skillLevel &&
      form.position &&
      form.role &&
      form.imageBase64 &&
      !validateImage(form.imageBase64);
    setFormValid(Boolean(isValid));
  }, [form]);

  // Compress and process image file
  const processFile = useCallback(async (file: File) => {
  console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
  setError("");
  setUploadProgress(0);
  setCompressionInProgress(true);

  try {
    // Validate file type before compression
    if (!file.type.match(/image\/(jpeg|png|jpg)/)) {
      throw new Error("Only JPEG or PNG images are allowed");
    }

    // Set up compression options
    const options = {
      maxSizeMB: 1.9, // Compress to slightly under 2MB
      maxWidthOrHeight: 1024,
      useWebWorker: true,
      initialQuality: 0.7,
    };

    // Compress the image
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);

    // Check compressed file size
    if (compressedFile.size > 2 * 1024 * 1024) {
      throw new Error("Please upload an image between 0-2MB. Compression couldn't reduce size enough.");
    }

    const reader = new FileReader();
    reader.onloadstart = () => setLoading(true);
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    reader.onloadend = () => {
      const base64String = reader.result?.toString() || "";
      setForm((prev) => ({ ...prev, imageBase64: base64String }));
      setImagePreview(base64String);
      setLoading(false);
      setUploadProgress(100);
      setCompressionInProgress(false);
    };
    reader.onerror = () => {
      setError("Failed to process image");
      setLoading(false);
      setUploadProgress(0);
      setCompressionInProgress(false);
    };
    reader.readAsDataURL(compressedFile);
  } catch (err: any) {
    console.error("Image processing error:", err);
    setError(err.message || "Image processing failed");
    setLoading(false);
    setUploadProgress(0);
    setCompressionInProgress(false);
  }
}, []);
  // Handle drag events
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Handle file input change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate image before submission
      const imageError = validateImage(form.imageBase64);
      if (imageError) {
        throw new Error(imageError);
      }

      // Submit onboarding data
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit");
      }

      // Force session update
      await fetch("/api/auth/session?update", {
        method: "GET",
        cache: "no-store",
      });

      // Show success and redirect
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard?_t=" + Date.now();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 p-4 md:p-8">
      {/* Success overlay animation */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white p-8 rounded-xl text-center"
            >
              <motion.svg
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                className="w-16 h-16 text-green-500 mx-auto mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </motion.svg>
              <h2 className="text-2xl font-bold text-gray-800">
                Profile Complete!
              </h2>
              <p className="text-gray-600 mt-2">
                Redirecting to your dashboard...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main form container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white p-8 rounded-3xl shadow-2xl relative overflow-hidden"
        >
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-100 rounded-full opacity-30"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-purple-100 rounded-full opacity-20"></div>

          {/* Form header */}
          <motion.div variants={itemVariants} className="relative z-10">
            <div className="flex justify-center mb-6">
              <motion.div
                whileHover={{ rotate: 10 }}
                className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <svg
                  className="w-8 h-8 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </motion.div>
            </div>
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Complete Your Profile
            </h1>
            <p className="text-center text-gray-500 mb-6">
              Just a few more details to get started
            </p>
          </motion.div>

          {/* Error message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm flex items-center"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form fields */}
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileFocus={{ scale: 1.01 }}
              >
                <input
                  type="tel"
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+234 80 3253 2020"
                  required
                />
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Level
              </label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <select
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  value={form.skillLevel}
                  onChange={(e) =>
                    setForm({ ...form, skillLevel: e.target.value })
                  }
                  required
                >
                  <option value="">Select your skill level</option>
                  {skillOptions.map((level) => (
                    <option key={level} value={level} className="capitalize">
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preferred Position
              </label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <select
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  value={form.position}
                  onChange={(e) =>
                    setForm({ ...form, position: e.target.value })
                  }
                  required
                >
                  <option value="">Select your position</option>
                  {positionOptions.map((pos) => (
                    <option key={pos} value={pos} className="capitalize">
                      {pos.charAt(0).toUpperCase() + pos.slice(1)}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <motion.div whileHover={{ scale: 1.01 }}>
                <select
                  className="mt-1 block w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwb2x5bGluZSBwb2ludHM9IjYgOSAxMiAxNSAxOCA5Ij48L3BvbHlsaW5lPjwvc3ZnPg==')] bg-no-repeat bg-[center_right_1rem]"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  required
                >
                  <option value="">Select your role</option>
                  {roleOptions.map((role) => (
                    <option key={role} value={role} className="capitalize">
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </option>
                  ))}
                </select>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture
              </label>
              <motion.div
                whileHover={{ scale: 1.01 }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`mt-1 flex flex-col items-center justify-center px-6 py-8 border-2 border-dashed rounded-xl transition-all duration-200 ${
                  isDragging
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-500"
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  id="profile-picture"
                  onChange={handleImageChange}
                  disabled={compressionInProgress}
                />
                <label
                  htmlFor="profile-picture"
                  className={`cursor-pointer text-center ${
                    compressionInProgress ? "opacity-50" : ""
                  }`}
                >
                  <svg
                    className="w-12 h-12 mx-auto text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG up to 2MB
                  </p>
                  {compressionInProgress && (
                    <p className="text-xs text-blue-600 mt-2">
                      Compressing image... please wait
                    </p>
                  )}
                </label>
              </motion.div>

              {/* Image preview with animation */}
              <AnimatePresence>
                {imagePreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 flex justify-center"
                  >
                    <div className="relative">
                      <motion.img
                        src={imagePreview}
                        alt="Preview"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                        whileHover={{ scale: 1.1 }}
                      />
                      <motion.button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setForm((prev) => ({ ...prev, imageBase64: "" }));
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        disabled={compressionInProgress}
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
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              {/* Upload progress indicator */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </motion.div>

            {/* Submit button */}
            <motion.div variants={itemVariants} className="pt-2">
              <motion.button
                type="submit"
                disabled={loading || !formValid || compressionInProgress}
                variants={buttonVariants}
                whileHover={formValid && !compressionInProgress ? "hover" : {}}
                whileTap={formValid && !compressionInProgress ? "tap" : {}}
                className={`w-full py-4 rounded-xl font-semibold text-white transition-all duration-300 ${
                  loading || compressionInProgress
                    ? "bg-blue-400"
                    : formValid
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="inline-block h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"
                    />
                    Processing...
                  </span>
                ) : compressionInProgress ? (
                  "Compressing Image..."
                ) : (
                  "Complete Profile"
                )}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}