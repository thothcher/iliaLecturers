const apiUrl = "https://68e010a393207c4b479399ed.mockapi.io/lecturers";

const form = document.getElementById("addLecturerForm");
const imageUrlInput = document.getElementById("imageUrl");
const imageFileInput = document.getElementById("imageFile");
const statusMsg = document.getElementById("status");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const faculty = document.getElementById("faculty").value.trim();

  let image = imageUrlInput.value.trim();

  // If no URL and file uploaded → convert file to base64
  if (!image && imageFileInput.files.length > 0) {
    image = await fileToBase64(imageFileInput.files[0]);
  }

  if (!image) {
    statusMsg.textContent = "Please provide an image link or upload a file.";
    statusMsg.style.color = "red";
    return;
  }

  const newLecturer = {
    name,
    faculty,
    image,
    comments: [],
    rating: [],
    avgScore: 0
  };

  try {
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLecturer)
    });

    if (res.ok) {
      statusMsg.textContent = "✅ Lecturer added successfully!";
      statusMsg.style.color = "green";
      form.reset();
    } else {
      throw new Error(`${res.status} ${res.statusText}`);
    }
  } catch (err) {
    console.error(err);
    statusMsg.textContent = "❌ Error adding lecturer. Try again.";
    statusMsg.style.color = "red";
  }
});

// Helper: file → base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
