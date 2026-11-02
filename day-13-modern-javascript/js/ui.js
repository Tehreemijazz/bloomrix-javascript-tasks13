
// ===============================
// UI MODULE
// Handles all page rendering
// ===============================

// HTML elements
const courseContainer = document.getElementById("courseContainer");
const statusElement = document.getElementById("status");
const courseCount = document.getElementById("courseCount");

const totalCourses = document.getElementById("totalCourses");
const totalCategories = document.getElementById("totalCategories");
const totalHours = document.getElementById("totalHours");

const categoryFilter = document.getElementById("categoryFilter");

// Loading state
export function showLoading() {

    statusElement.textContent = "Loading courses...";

    statusElement.className = "status";

    courseContainer.replaceChildren();

    courseCount.textContent = "Please wait...";

}

// Error state
export function showError(message) {

    statusElement.textContent = message;

    statusElement.className = "status error";

    courseContainer.replaceChildren();

    courseCount.textContent = "Unable to load courses";

}

// Empty state
export function showEmpty() {

    statusElement.textContent =
        "No courses found. Try another search or filter.";

    statusElement.className = "status empty";

    courseContainer.replaceChildren();

    courseCount.textContent = "0 courses found";

}

// Success state
function showSuccess() {

    statusElement.textContent = "";

    statusElement.className = "status success";

}

// Display categories
export function renderCategories(categories) {

    const fragment = document.createDocumentFragment();

    const defaultOption = document.createElement("option");

    defaultOption.value = "all";
    defaultOption.textContent = "All Categories";

    fragment.appendChild(defaultOption);

    categories.forEach(category => {

        const option = document.createElement("option");

        option.value = category;
        option.textContent = category;

        fragment.appendChild(option);

    });

    categoryFilter.replaceChildren(fragment);

}

// Display statistics
export function renderStatistics(courses, categories) {

    totalCourses.textContent = courses.length;

    totalCategories.textContent = categories.length;

    // Reduce calculates the total course duration
    const hours = courses.reduce((total, course) => {

        return total + course.duration;

    }, 0);

    totalHours.textContent = hours;

}

// Create one course card
function createCourseCard(course) {

    const card = document.createElement("article");

    card.className = "course-card";

    const image = document.createElement("div");

    image.className = "course-image";

    image.textContent = course.icon ?? "📚";

    const content = document.createElement("div");

    content.className = "course-content";

    const title = document.createElement("h3");

    title.textContent = course.title;

    const category = document.createElement("span");

    category.className = "category";

    category.textContent = course.category;

    const description = document.createElement("p");

    description.className = "course-description";

    description.textContent = course.description;

    const details = document.createElement("div");

    details.className = "course-details";

    const duration = document.createElement("span");

    duration.textContent = `${course.duration} Hours`;

    const level = document.createElement("span");

    level.textContent = course.level;

    details.append(duration, level);

    content.append(
        title,
        category,
        description,
        details
    );

    card.append(image, content);

    return card;

}

// Render courses
export function renderCourses(courses) {

    courseContainer.replaceChildren();

    if (courses.length === 0) {

        showEmpty();

        return;

    }

    const fragment = document.createDocumentFragment();

    // Map creates an array of course cards
    const cards = courses.map(createCourseCard);

    cards.forEach(card => {

        fragment.appendChild(card);

    });

    courseContainer.appendChild(fragment);

    courseCount.textContent =
        `${courses.length} courses available`;

    showSuccess();

}
