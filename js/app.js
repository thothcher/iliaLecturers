const apiUrl = "https://68e010a393207c4b479399ed.mockapi.io/lecturers";
const container = document.getElementById("lecturers");
const searchInput = document.getElementById("search");
const facultyFilter = document.getElementById("facultyFilter");

let lecturersData = [];
let filteredLecturers = [];

// Fetch lecturers
async function loadLecturers() {
  const res = await fetch(apiUrl);
  lecturersData = await res.json();

  // Populate faculty dropdown
  const faculties = [...new Set(lecturersData.map(l => l.faculty))].sort();
  facultyFilter.innerHTML = `<option value="all">All Faculties</option>`;
  faculties.forEach(f => {
    facultyFilter.innerHTML += `<option value="${f}">${f}</option>`;
  });

  applyFilters();
}

// Apply search + filter
function applyFilters() {
  const searchValue = searchInput.value.toLowerCase();
  const facultyValue = facultyFilter.value;

  filteredLecturers = lecturersData.filter(l => {
    const matchesName = l.name.toLowerCase().includes(searchValue);
    const matchesFaculty = facultyValue === "all" || l.faculty === facultyValue;
    return matchesName && matchesFaculty;
  });

  renderLecturers(filteredLecturers);
}

// Render lecturer cards
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

    // Update rating label
    const range = card.querySelector("input[type=range]");
    const label = card.querySelector(".rating-label");
    range.addEventListener("input", () => {
      label.textContent = `Rating: ${range.value}`;
    });

    // Handle form submit
    const form = card.querySelector("form");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const rating = parseInt(form.rating.value);
      const comment = form.comment.value;

      const updatedRatings = [...l.rating, rating];
      const avgScore = (
        updatedRatings.reduce((a, b) => a + b, 0) / updatedRatings.length
      ).toFixed(1);

      const updatedLecturer = {
        ...l,
        rating: updatedRatings,
        comments: [...l.comments, comment],
        avgScore
      };

      await fetch(`${apiUrl}/${l.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedLecturer)
      });

      loadLecturers();
    });

    container.appendChild(card);
  });
}

// Events
searchInput.addEventListener("input", applyFilters);
facultyFilter.addEventListener("change", applyFilters);

// Init
loadLecturers();
