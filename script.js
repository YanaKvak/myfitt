document.addEventListener("DOMContentLoaded", () => {
  setupFilters();
  
  document.querySelectorAll(".btn-primary").forEach((button) => {
    button.addEventListener("click", () => {
      const trainerCard = button.closest(".trainer-card");
      const trainerName = trainerCard.querySelector("h5").textContent;
      const city = trainerCard.getAttribute("data-city");
      const gym = trainerCard.getAttribute("data-gym");

      if (button.classList.contains("booked")) {
        showBookingInfo(trainerName);
      } else {
        openBookingModal(trainerName, city, gym, button);
      }
    });
  });
});

// Функция для фильтрации тренеров
function setupFilters() {
  document.getElementById("cityFilter").addEventListener("change", filterTrainers);
  document.getElementById("gymFilter").addEventListener("change", filterTrainers);
  document.getElementById("specialtyFilter").addEventListener("change", filterTrainers);
}

// Фильтруем тренеров в списке
function filterTrainers() {
  const selectedCity = document.getElementById("cityFilter").value;
  const selectedGym = document.getElementById("gymFilter").value;
  const selectedSpecialty = document.getElementById("specialtyFilter").value;

  document.querySelectorAll(".trainer-card").forEach((trainerCard) => {
    const trainerCity = trainerCard.getAttribute("data-city");
    const trainerGym = trainerCard.getAttribute("data-gym");
    const trainerSpecialty = trainerCard.getAttribute("data-specialty");

    // Проверяем, соответствует ли тренер выбранному городу, залу и специальности
    const matchesCity = selectedCity === "" || trainerCity === selectedCity;
    const matchesGym = selectedGym === "" || trainerGym === selectedGym;
    const matchesSpecialty = selectedSpecialty === "" || trainerSpecialty === selectedSpecialty;

    if (matchesCity && matchesGym && matchesSpecialty) {
      trainerCard.style.display = "block"; // Показываем
    } else {
      trainerCard.style.display = "none"; // Скрываем
    }
  });
}

// Функция открытия модального окна записи
function openBookingModal(trainerName, city, gym, button) {
  const modal = document.getElementById("bookingModal");
  modal.querySelector(".modal-title").textContent = `Запись к ${trainerName}`;
  modal.dataset.trainerName = trainerName;
  modal.dataset.city = city;
  modal.dataset.gym = gym;
  modal.dataset.buttonId = button.id;

  // Очистка списков перед открытием
  const dateSelect = document.getElementById("availableDates");
  dateSelect.innerHTML = `<option value="">Выберите дату</option>`;
  generateDates().forEach((date) => {
    const option = document.createElement("option");
    option.value = date;
    option.textContent = date;
    dateSelect.appendChild(option);
  });

  document.getElementById("availableTimes").innerHTML = `<option value="">Выберите время</option>`;

  // Показываем модальное окно
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

// Генерация дат (на 7 дней вперёд)
function generateDates() {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 7; i++) {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + i);
    dates.push(futureDate.toISOString().split("T")[0]); // Формат YYYY-MM-DD
  }
  return dates;
}

// Генерация времени при выборе даты
document.getElementById("availableDates").addEventListener("change", function () {
  const timeSelect = document.getElementById("availableTimes");
  timeSelect.innerHTML = `<option value="">Выберите время</option>`;
  ["10:00", "12:00", "14:00", "16:00", "18:00"].forEach((time) => {
    const option = document.createElement("option");
    option.value = time;
    option.textContent = time;
    timeSelect.appendChild(option);
  });
});

// Подтверждение записи
function confirmBooking() {
  const modal = document.getElementById("bookingModal");
  const trainerName = modal.dataset.trainerName;
  const city = modal.dataset.city;
  const gym = modal.dataset.gym;

  const selectedDate = document.getElementById("availableDates").value;
  const selectedTime = document.getElementById("availableTimes").value;

  if (!selectedDate || !selectedTime) {
    alert("Выберите дату и время!");
    return;
  }

  saveBooking(trainerName, city, gym, selectedDate, selectedTime);

  // Находим кнопку "Записаться" по имени тренера
  document.querySelectorAll(".trainer-card").forEach((trainerCard) => {
    if (trainerCard.querySelector("h5").textContent === trainerName) {
      const button = trainerCard.querySelector(".btn-primary");
      updateButtonToBooked(button, trainerName);
    }
  });

  bootstrap.Modal.getInstance(modal).hide();
}


// Сохранение записи в localStorage
function saveBooking(trainerName, city, gym, date, time) {
  let bookings = JSON.parse(localStorage.getItem("bookings")) || {};
  bookings[trainerName] = { city, gym, date, time };
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

// Загрузка записей из localStorage при загрузке страницы
function loadSavedBookings() {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || {};
  document.querySelectorAll(".trainer-card").forEach((trainerCard) => {
    const trainerName = trainerCard.querySelector("h5").textContent;
    if (bookings[trainerName]) {
      const button = trainerCard.querySelector(".btn-primary");
      updateButtonToBooked(button, trainerName);
    }
  });
}

// Обновление кнопки после записи
function updateButtonToBooked(button, trainerName) {
  button.textContent = "Вы записаны";
  button.classList.add("booked", "btn-success");
  button.classList.remove("btn-primary");
  button.onclick = () => showBookingInfo(trainerName);
}

// Показ информации о записи
function showBookingInfo(trainerName) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || {};
  const booking = bookings[trainerName];

  if (booking) {
    const isCancel = confirm(
      `Вы записаны к ${trainerName}\n📍 Город: ${booking.city}\n🏋️‍♂️ Зал: ${booking.gym}\n📅 Дата: ${booking.date}\n🕒 Время: ${booking.time}\n\nОтменить запись?`
    );

    if (isCancel) {
      cancelBooking(trainerName);
    }
  }
}

// Отмена записи
function cancelBooking(trainerName) {
  const bookings = JSON.parse(localStorage.getItem("bookings")) || {};
  delete bookings[trainerName];
  localStorage.setItem("bookings", JSON.stringify(bookings));

  document.querySelectorAll(".trainer-card").forEach((trainerCard) => {
    const trainerNameCard = trainerCard.querySelector("h5").textContent;
    if (trainerNameCard === trainerName) {
      resetButton(trainerCard.querySelector(".booked"));
    }
  });
}

// Возврат кнопки в исходное состояние
function resetButton(button) {
  button.textContent = "Записаться";
  button.classList.remove("booked", "btn-success");
  button.classList.add("btn-primary");

  button.onclick = () => {
    const trainerCard = button.closest(".trainer-card");
    const trainerName = trainerCard.querySelector("h5").textContent;
    const city = trainerCard.getAttribute("data-city");
    const gym = trainerCard.getAttribute("data-gym");

    openBookingModal(trainerName, city, gym, button);
  };
}
