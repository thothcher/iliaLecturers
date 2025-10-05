const API_URL = "https://68e010a393207c4b479399ed.mockapi.io/lecturers";

// Elements
const form = document.getElementById("addLecturerForm");
const imageUrlInput = document.getElementById("imageUrl");
const imageFileInput = document.getElementById("imageFile");
const statusMsg = document.getElementById("status");
const ratingSlider = document.getElementById("rating");
const ratingValue = document.getElementById("ratingValue");

// Live update rating value
ratingSlider.addEventListener("input", () => {
  ratingValue.textContent = ratingSlider.value;
});

/**
 * Convert uploaded file to Base64 string
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Show status message
 */
function showStatus(message, type = "info") {
  statusMsg.textContent = message;
  statusMsg.style.color = type === "error" ? "red" : type === "success" ? "green" : "black";
}

/**
 * Reset form to initial state
 */
function resetForm() {
  form.reset();
  ratingSlider.value = 5;
  ratingValue.textContent = "5";
}

/**
 * Collect form data and validate
 */
async function getFormData() {
  const name = document.getElementById("name").value.trim();
  const faculty = document.getElementById("faculty").value;
  const comment = document.getElementById("comments").value.trim();
  const rating = parseInt(ratingSlider.value, 10);
  let image = imageUrlInput.value.trim();

  if (!name || !faculty) {
    throw new Error("Name and Faculty are required.");
  }

  if (isNaN(rating) || rating < 0 || rating > 10) {
    throw new Error("Rating must be between 0 and 10.");
  }

  // Handle file upload → Base64 if no URL provided
  if (!image && imageFileInput.files.length > 0) {
    image = await fileToBase64(imageFileInput.files[0]);
  }

  if (!image) {
    throw new Error("Please provide an image link or upload a file.");
  }

  return {
    name,
    faculty,
    image,
    comments: comment ? [comment] : [],
    rating: [rating],
    avgScore: rating.toFixed(1)
  };
}

/**
 * Submit form
 */
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const lecturerData = await getFormData();

    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lecturerData),
    });

    if (!res.ok) throw new Error("Failed to add lecturer.");

    showStatus("✅ Lecturer added successfully!", "success");
    resetForm();
  } catch (err) {
    console.error(err);
    showStatus(`❌ ${err.message}`, "error");
  }
});
