const apiUrl = "https://68e010a393207c4b479399ed.mockapi.io/lecturers";

// Elements
const container = document.getElementById("lecturers");
const searchInput = document.getElementById("searchInput");
const facultyFilter = document.getElementById("facultyFilter");
const ratingFilter = document.getElementById("ratingFilter");
const ratingFilterValue = document.getElementById("ratingFilterValue");
const loader = document.querySelector(".loader-co");

let lecturersData = [];
let filteredLecturers = [];

// ======================
// Fetch & Init
// ======================
async function loadLecturers() {
  try {
    const res = await fetch(apiUrl);
    lecturersData = await res.json();

    populateFacultyDropdown(lecturersData);
    loader.remove();
    applyFilters();
  } catch (err) {
    console.error("Error loading lecturers:", err);
    container.innerHTML = `<p style="text-align:center;color:red">❌ Failed to load lecturers.</p>`;
  }
}

// ======================
// UI Helpers
// ======================
function populateFacultyDropdown(data) {
  const faculties = [...new Set(data.map(l => l.faculty))].sort();
  facultyFilter.innerHTML = `<option value="all">All Faculties</option>`;
  faculties.forEach(f => {
    facultyFilter.innerHTML += `<option value="${f}">${f}</option>`;
  });
}

function renderLecturers(list) {
  container.innerHTML = "";

  if (list.length === 0) {
    container.innerHTML = `<p style="text-align:center;width:100%">No lecturers found.</p>`;
    return;
  }

  list.forEach(l => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${l.image}" alt="${l.name}">
      <h2>${l.name}</h2>
      <p><em>${l.faculty}</em></p>
      <p class="avg-score">⭐ ${l.avgScore}/10</p>
      <div class="comments">
        ${l.comments.slice(-3).map(c => `<p>💬 ${c}</p>`).join("")}
      </div>
      <form data-id="${l.id}">
        <label>Rate this lecturer</label>
        <input type="range" min="0" max="10" value="5" name="rating">
        <p class="rating-label">Rating: 5</p>
        <textarea name="comment" placeholder="Write a comment..." required></textarea>
        <button type="submit">Submit Review</button>
      </form>
    `;

    setupCardEvents(card, l);
    container.appendChild(card);
  });
}

function setupCardEvents(card, lecturer) {
  const range = card.querySelector("input[type=range]");
  const label = card.querySelector(".rating-label");
  const form = card.querySelector("form");

  // Live update rating label
  range.addEventListener("input", () => {
    label.textContent = `Rating: ${range.value}`;
  });

  // Check if user already reviewed this lecturer
  const reviewedLecturers = JSON.parse(localStorage.getItem("reviewedLecturers")) || [];
  if (reviewedLecturers.includes(lecturer.id)) {
    form.querySelector("textarea").disabled = true;
    range.disabled = true;
    form.querySelector("button").disabled = true;
    form.insertAdjacentHTML("beforeend", `<p style="color:gray;font-size:0.9em;">⚠ You already reviewed this lecturer.</p>`);
    return;
  }

  // Handle review submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const rating = parseInt(form.rating.value);
    const comment = form.comment.value.trim();

    if (!comment) return;

    const updatedRatings = [...lecturer.rating, rating];
    const avgScore = (
      updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length
    ).toFixed(1);

    const updatedLecturer = {
      ...lecturer,
      rating: updatedRatings,
      comments: [...lecturer.comments, comment],
      avgScore
    };

    try {
      await fetch(`${apiUrl}/${lecturer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLecturer)
      });

      // ✅ Save lecturer ID in localStorage
      reviewedLecturers.push(lecturer.id);
      localStorage.setItem("reviewedLecturers", JSON.stringify(reviewedLecturers));

      loadLecturers();
    } catch (err) {
      console.error("Error submitting review:", err);
      alert("❌ Failed to submit review. Try again.");
    }
  });
}

// ======================
// Filtering
// ======================
function applyFilters() {
  const searchValue = searchInput.value.toLowerCase();
  const facultyValue = facultyFilter.value;
  const minRating = parseFloat(ratingFilter.value);

  filteredLecturers = lecturersData.filter(l => {
    const matchesName = l.name.toLowerCase().includes(searchValue);
    const matchesFaculty = facultyValue === "all" || l.faculty === facultyValue;
    const matchesRating = parseFloat(l.avgScore) >= minRating;
    return matchesName && matchesFaculty && matchesRating;
  });

  renderLecturers(filteredLecturers);
}

// ======================
// Event Listeners
// ======================
searchInput.addEventListener("input", applyFilters);
facultyFilter.addEventListener("change", applyFilters);
ratingFilter.addEventListener("input", () => {
  ratingFilterValue.textContent = ratingFilter.value;
  applyFilters();
});

// ======================
// Init
// ======================
loadLecturers();
