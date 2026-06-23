console.log("Welcome to the Community Portal");

window.addEventListener("load", function() {
  alert("Welcome! The Community Event Portal has fully loaded.");
});

const PORTAL_NAME = "Local Community Event Portal";
const LAUNCH_DATE = "2026-06-13";
let totalSeats = 100;

console.log(PORTAL_NAME + " launched on " + LAUNCH_DATE + ". Total seats: " + totalSeats);

class CommunityEvent {
  constructor(id, name, date, category, location, seats, description) {
    this.id = id;
    this.name = name;
    this.date = new Date(date);
    this.category = category;
    this.location = location;
    this.seats = seats;
    this.description = description;
  }

  checkAvailability() {
    return this.seats > 0 && this.date >= new Date();
  }

  getSummary() {
    return this.name + " | " + this.date.toDateString() + " | Seats: " + this.seats;
  }
}

let eventsArray = [
  new CommunityEvent(1, "Jazz Night",          "2026-07-10", "music",    "downtown", 30, "A relaxing evening of live jazz."),
  new CommunityEvent(2, "Baking Workshop",     "2026-07-15", "workshop", "suburb",   20, "Learn artisan bread-making."),
  new CommunityEvent(3, "5K Fun Run",          "2026-07-20", "sports",   "uptown",   50, "Community 5K for all fitness levels."),
  new CommunityEvent(4, "Street Food Festival","2026-07-25", "food",     "downtown",  0, "Taste dishes from 20+ vendors."),
  new CommunityEvent(5, "Rock Concert",        "2026-08-01", "music",    "uptown",   15, "Live rock bands from the city."),
  new CommunityEvent(6, "Pottery Class",       "2025-01-01", "workshop", "suburb",   10, "Past event."),
  new CommunityEvent(7, "Community Yoga",      "2026-08-05", "sports",   "downtown", 25, "Morning yoga session in the park."),
  new CommunityEvent(8, "Cooking Masterclass", "2026-08-10", "food",     "suburb",   12, "Gourmet cooking with a professional chef."),
];

function createCategoryTracker() {
  const counts = {};
  return {
    register: function(category) {
      counts[category] = (counts[category] || 0) + 1;
    },
    getCounts: function() {
      return Object.assign({}, counts);
    },
    getTotal: function() {
      return Object.values(counts).reduce(function(sum, n) { return sum + n; }, 0);
    }
  };
}

const categoryTracker = createCategoryTracker();

function registerUser(eventId, userName) {
  try {
    const event = eventsArray.find(function(e) { return e.id === eventId; });
    if (!event) throw new Error("Event not found.");
    if (!event.checkAvailability()) throw new Error(event.name + " is either full or has already passed.");
    if (!userName || userName.trim() === "") throw new Error("User name cannot be empty.");
    event.seats--;
    categoryTracker.register(event.category);
    console.log(userName + " registered for " + event.name + ". Seats left: " + event.seats);
    return { success: true, event: event };
  } catch (err) {
    console.error("Registration error: " + err.message);
    return { success: false, message: err.message };
  }
}

function getMusicEvents() {
  return eventsArray.filter(function(e) { return e.category === "music"; });
}

function getFormattedTitles() {
  return eventsArray.map(function(e) {
    return e.category.charAt(0).toUpperCase() + e.category.slice(1) + " - " + e.name;
  });
}

console.log("Formatted titles:", getFormattedTitles());
console.log("Music events:", getMusicEvents().map(function(e) { return e.name; }));

function createMockAPI() {
  const mockData = eventsArray.map(function(e) {
    return {
      id: e.id, name: e.name,
      date: e.date.toISOString().split("T")[0],
      category: e.category, location: e.location,
      seats: e.seats, description: e.description
    };
  });
  const blob = new Blob([JSON.stringify(mockData)], { type: "application/json" });
  return URL.createObjectURL(blob);
}

function showSpinner(visible) {
  const spinner = document.getElementById("loadingSpinner");
  if (visible) { spinner.classList.remove("hidden"); }
  else         { spinner.classList.add("hidden"); }
}

function fetchEventsWithThen(url) {
  showSpinner(true);
  fetch(url)
    .then(function(res) {
      if (!res.ok) throw new Error("Network error");
      return res.json();
    })
    .then(function(data) {
      console.log("Events fetched (then/catch):", data.length);
      showSpinner(false);
    })
    .catch(function(err) {
      console.error("Fetch error:", err);
      showSpinner(false);
    });
}

async function fetchEventsAsync(url) {
  showSpinner(true);
  try {
    const res  = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch events.");
    const data = await res.json();
    console.log("Events fetched (async/await):", data.length);
    return data;
  } catch (err) {
    console.error("Async fetch error:", err);
  } finally {
    showSpinner(false);
  }
}

async function postRegistration(payload) {
  await new Promise(function(resolve) { setTimeout(resolve, 1200); });
  try {
    const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Server error.");
    const data = await res.json();
    console.log("POST response:", data);
    return { success: true };
  } catch (err) {
    console.error("POST error:", err);
    return { success: false, message: err.message };
  }
}

function renderEventCard(event) {
  if (!event.checkAvailability()) return;

  const container = document.getElementById("eventsContainer");
  const { id, name, category, location, description, seats } = event;
  const dateStr = event.date.toDateString();
  const seatsClass = seats > 0 ? "available" : "";

  const card = document.createElement("div");
  card.className = "event-card";
  card.dataset.id = id;
  card.dataset.category = category;
  card.dataset.location = location;

  card.innerHTML =
    "<h3>" + name + "</h3>" +
    "<span class='badge badge-" + category + "'>" + category + "</span>" +
    "<p>📅 " + dateStr + "</p>" +
    "<p>📍 " + location.charAt(0).toUpperCase() + location.slice(1) + "</p>" +
    "<p>" + description + "</p>" +
    "<p class='seats " + seatsClass + "'>🎟 Seats available: " + seats + "</p>" +
    "<button onclick='handleRegisterClick(" + id + ")' " + (seats === 0 ? "disabled" : "") + ">Register</button>";

  container.appendChild(card);
}

function renderAllEvents() {
  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";
  eventsArray.forEach(function(event) { renderEventCard(event); });
  populateEventSelect();
}

function populateEventSelect() {
  const select = document.getElementById("eventSelect");
  select.innerHTML = '<option value="">-- Choose an Event --</option>';
  eventsArray.forEach(function(event) {
    if (event.checkAvailability()) {
      const opt = document.createElement("option");
      opt.value = event.id;
      opt.textContent = event.name;
      select.appendChild(opt);
    }
  });
}

function handleRegisterClick(eventId) {
  document.getElementById("register").scrollIntoView({ behavior: "smooth" });
  document.getElementById("eventSelect").value = eventId;
  console.log("Register clicked for event ID:", eventId);
}

document.getElementById("categoryFilter").addEventListener("change", function() {
  applyFilters();
});

document.getElementById("locationFilter").addEventListener("change", function() {
  applyFilters();
});

document.getElementById("searchInput").addEventListener("keydown", function() {
  setTimeout(applyFilters, 50);
});

function applyFilters() {
  const category = document.getElementById("categoryFilter").value;
  const location = document.getElementById("locationFilter").value;
  const query    = document.getElementById("searchInput").value.toLowerCase().trim();

  const filtered = eventsArray.slice().filter(function(event) {
    const matchCategory = category === "all" || event.category === category;
    const matchLocation = location === "all" || event.location === location;
    const matchQuery    = query === "" || event.name.toLowerCase().includes(query);
    return matchCategory && matchLocation && matchQuery && event.checkAvailability();
  });

  const container = document.getElementById("eventsContainer");
  container.innerHTML = "";
  filtered.forEach(function(event) { renderEventCard(event); });
}

document.getElementById("registrationForm").addEventListener("submit", async function(e) {
  e.preventDefault();

  const name    = e.target.elements.userName.value.trim();
  const email   = e.target.elements.userEmail.value.trim();
  const date    = e.target.elements.eventDate.value;
  const eventId = parseInt(e.target.elements.eventSelect.value);

  console.log("Form submitted — Name:", name, "Email:", email, "Event ID:", eventId);

  document.getElementById("nameError").textContent  = "";
  document.getElementById("emailError").textContent = "";
  document.getElementById("dateError").textContent  = "";
  document.getElementById("eventError").textContent = "";

  let valid = true;
  if (!name)  { document.getElementById("nameError").textContent  = "Name is required."; valid = false; }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    document.getElementById("emailError").textContent = "Enter a valid email."; valid = false;
  }
  if (!date)    { document.getElementById("dateError").textContent  = "Please select a date."; valid = false; }
  if (!eventId) { document.getElementById("eventError").textContent = "Please select an event."; valid = false; }
  if (!valid) return;

  const output = document.getElementById("confirmOutput");
  output.style.display = "block";
  output.textContent = "Thank you, " + name + "! Your registration for event on " + date + " is confirmed.";

  localStorage.setItem("userName", name);

  const result = registerUser(eventId, name);
  if (!result.success) { showFormMessage(result.message, "error"); return; }

  console.log("Sending registration to server...");
  showFormMessage("Submitting registration...", "success");

  const postResult = await postRegistration({ name: name, email: email, eventId: eventId });

  if (postResult.success) {
    showFormMessage(name + ", you are registered for " + result.event.name + "!", "success");
  } else {
    showFormMessage("Submission failed: " + postResult.message, "error");
  }

  applyFilters();
  renderStats();
  e.target.reset();
});

function showFormMessage(msg, type) {
  const el = document.getElementById("formMessage");
  el.textContent = msg;
  el.className = "form-message " + type;
  el.classList.remove("hidden");
}

function renderStats() {
  const container = document.getElementById("statsContainer");
  const counts = categoryTracker.getCounts();
  const total  = categoryTracker.getTotal();

  if (total === 0) { container.innerHTML = "<p>No registrations yet.</p>"; return; }

  container.innerHTML = "";
  Object.entries(counts).forEach(function([category, count]) {
    const item = document.createElement("div");
    item.className = "stat-item";
    item.innerHTML = "<span>" + category.charAt(0).toUpperCase() + category.slice(1) + "</span><span>" + count + "</span>";
    container.appendChild(item);
  });

  const totalItem = document.createElement("div");
  totalItem.className = "stat-item";
  totalItem.innerHTML = "<strong>Total</strong><strong>" + total + "</strong>";
  container.appendChild(totalItem);
}

$(document).ready(function() {
  $("#registerBtn").click(function() {
    console.log("jQuery: Register button clicked.");
  });

  $(".event-card").fadeIn(400);

  window.jQueryFadeOutCard = function(cardEl) {
    $(cardEl).fadeOut(300, function() { $(this).remove(); });
  };

  console.log("jQuery ready.");
});

document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener("click", function(e) {
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});

(function initBanner() {
  const savedName = localStorage.getItem("userName");
  if (savedName) {
    const banner = document.getElementById("welcomeBanner");
    if (banner) {
      banner.innerHTML = "👋 Welcome back, <strong>" + savedName + "</strong>! &nbsp;" +
        "<span style='color:#ffe066; font-weight:bold;'>🎉 Special Offer: Free entry to the next Music event!</span>";
    }
  }
})();

function toggleEnlarge(img) {
  img.classList.toggle("enlarged");
}

function validatePhone(input) {
  const val = input.value.trim();
  const errEl = document.getElementById("phoneError");
  const phoneRegex = /^[\+]?[\d\s\-]{10,14}$/;
  if (val && !phoneRegex.test(val)) {
    errEl.textContent = "Enter a valid phone number (10-13 digits).";
  } else {
    errEl.textContent = "";
  }
}

function showEventFee(select) {
  const selected = select.options[select.selectedIndex];
  const fee = selected.getAttribute("data-fee");
  document.getElementById("feeDisplay").textContent = fee ? "Entry fee: " + fee : "";
}

function updateCharCount() {
  const len = document.getElementById("feedbackText").value.length;
  document.getElementById("charCount").textContent = len + " character" + (len !== 1 ? "s" : "");
}

function submitFeedback() {
  const event    = document.getElementById("feedbackEvent").value;
  const feedback = document.getElementById("feedbackText").value.trim();
  const msgEl    = document.getElementById("feedbackMsg");

  if (!event || !feedback) {
    msgEl.style.color = "#e74c3c";
    msgEl.textContent = "Please select an event and enter your feedback.";
    return;
  }

  msgEl.style.color = "#27ae60";
  msgEl.textContent = "Thanks for your feedback on \"" + event + "\"!";
}

function onVideoReady() {
  document.getElementById("videoStatus").textContent = "Video ready to play!";
}

window.addEventListener("beforeunload", function(e) {
  const feedback = document.getElementById("feedbackText");
  if (feedback && feedback.value.trim().length > 0) {
    e.preventDefault();
  }
});

function savePreference() {
  const val = document.getElementById("prefEventType").value;
  if (val) {
    localStorage.setItem("preferredEventType", val);
    sessionStorage.setItem("sessionPref", val);
    document.getElementById("prefStatus").textContent = "Preference \"" + val + "\" saved.";
  }
}

function loadPreference() {
  const saved = localStorage.getItem("preferredEventType");
  if (saved) {
    const select = document.getElementById("prefEventType");
    if (select) {
      select.value = saved;
      document.getElementById("prefStatus").textContent = "Restored preference: \"" + saved + "\"";
    }
  }
}

function clearPreferences() {
  localStorage.removeItem("preferredEventType");
  localStorage.removeItem("userName");
  sessionStorage.clear();
  document.getElementById("prefStatus").textContent = "Preferences cleared.";
  document.getElementById("prefEventType").value = "";
  const banner = document.getElementById("welcomeBanner");
  if (banner) {
    banner.innerHTML = "👋 Welcome! &nbsp;<span style='color:#ffe066; font-weight:bold;'>🎉 Special Offer: Free entry to the next Music event!</span>";
  }
}

function findNearbyEvents() {
  const resultEl = document.getElementById("geoResult");
  resultEl.textContent = "Locating you...";

  if (!navigator.geolocation) {
    resultEl.textContent = "Geolocation is not supported by your browser.";
    return;
  }

  const options = {
    enableHighAccuracy: true,
    timeout: 8000,
    maximumAge: 0
  };

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude.toFixed(5);
      const lon = position.coords.longitude.toFixed(5);
      const acc = Math.round(position.coords.accuracy);
      resultEl.innerHTML =
        "Location found!<br>" +
        "Latitude: <strong>" + lat + "</strong><br>" +
        "Longitude: <strong>" + lon + "</strong><br>" +
        "Accuracy: ±" + acc + " metres";
    },
    function(error) {
      const messages = {
        1: "Permission denied. Please allow location access.",
        2: "Position unavailable. Check your connection.",
        3: "Request timed out. Try again."
      };
      resultEl.textContent = messages[error.code] || "Unknown geolocation error.";
    },
    options
  );
}

document.addEventListener("DOMContentLoaded", function() {
  loadPreference();
});

(async function init() {
  const mockApiUrl = createMockAPI();
  await fetchEventsAsync(mockApiUrl);
  fetchEventsWithThen(createMockAPI());
  renderAllEvents();
  renderStats();

  eventsArray.forEach(function(event) {
    if (!event.checkAvailability()) {
      console.log("Hidden (past/full):", event.name);
    }
  });
})();
