const apiUrl = "https://68e010a393207c4b479399ed.mockapi.io/lecturers";

const form = document.getElementById("addLecturerForm");
const imageUrlInput = document.getElementById("imageUrl");
const imageFileInput = document.getElementById("imageFile");
const statusMsg = document.getElementById("status");
const ratingSlider = document.getElementById("rating");
const ratingValue = document.getElementById("ratingValue");

// Update rating live
ratingSlider.addEventListener("input", () => {
    ratingValue.textContent = ratingSlider.value;
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const faculty = document.getElementById("faculty").value; // from select
    const comment = document.getElementById("comments").value.trim();
    const rating = parseInt(ratingSlider.value);

    const comments = comment ? [comment] : [];
    const ratings = [rating];
    const avgScore = rating.toFixed(1);

    let image = imageUrlInput.value.trim();

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
        comments,
        rating: ratings,
        avgScore
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
            ratingSlider.value = 5;
            ratingValue.textContent = "5";
        } else {
            throw new Error("Failed to add lecturer");
        }
    } catch (err) {
        console.error(err);
        statusMsg.textContent = "❌ Error adding lecturer. Try again.";
        statusMsg.style.color = "red";
    }
});

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
