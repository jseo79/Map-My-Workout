'use strict';

import * as activity from './activities.js';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
const resetButton = document.querySelector('.button_reset');
const closeButtons = document.querySelectorAll('.close_buttons');

class ClientApp {
	#map;
	#mapEvent;
	#workouts = [];
	#markers = [];

	constructor() {
		this._getPosition();
		form.addEventListener('submit', this._newWorkout.bind(this));
		inputType.addEventListener('change', this._toggleElevationField);
		containerWorkouts.addEventListener(
			'click',
			this._moveToPopup.bind(this)
		);
		resetButton.addEventListener('click', () => {
			const confirmation = confirm('Are you sure you want to proceed?');
			if (confirmation) {
				this.reset();
			}
		});
		containerWorkouts.addEventListener('click', (event) => {
			if (event.target.classList.contains('close_buttons')) {
				this._deleteWorkout(event.target);
			}
		});
	}

	// Permission to access user location
	_getPosition() {
		if (navigator.geolocation)
			navigator.geolocation.getCurrentPosition(
				this._loadMap.bind(this),
				function () {
					alert('Could not get your location');
				}
			);
	}

	_loadMap(position) {
		const { latitude } = position.coords;
		const { longitude } = position.coords;
		const coords = [latitude, longitude];

		this.#map = L.map('map').setView(coords, 13);

		L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution:
				'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
		}).addTo(this.#map);

		// Handling clicks on maps
		this.#map.on('click', this._showForm.bind(this));

		// Loading workouts from localStorage
		this.#workouts.forEach((work) => {
			this._renderWorkout(work);
			this._renderWorkoutMarker(work);
		});
	}

	_showForm(mapE) {
		this.#mapEvent = mapE;
		form.classList.remove('hidden');
		inputDistance.focus();
	}

	_hideForm() {
		//Clear input fields
		inputDistance.value =
			inputDuration.value =
			inputCadence.value =
			inputElevation.value =
				'';
		form.style.display = 'none';
		form.classList.add('hidden');
		form.style.display = 'grid';
	}

	_toggleElevationField() {
		inputElevation
			.closest('.form__row')
			.classList.toggle('form__row--hidden');
		inputCadence
			.closest('.form__row')
			.classList.toggle('form__row--hidden');
	}

	_newWorkout(e) {
		const validInputs = (...inputs) =>
			inputs.every((inp) => Number.isFinite(inp));
		const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

		e.preventDefault();

		const { lat, lng } = this.#mapEvent.latlng;

		const type = inputType.value;
		const distance = +inputDistance.value;
		const duration = +inputDuration.value;
		let workout;

		if (type === 'running') {
			const cadence = +inputCadence.value;
			if (
				!validInputs(distance, duration, cadence) ||
				!allPositive(distance, duration, cadence)
			)
				return alert('Inputs have to be positive numbers');

			workout = new activity.Running(
				[lat, lng],
				distance,
				duration,
				cadence
			);
		}

		if (type === 'biking') {
			const elevation = +inputElevation.value;
			if (
				!validInputs(distance, duration, elevation) ||
				!allPositive(distance, duration)
			)
				return alert('Inputs have to be positive numbers');

			workout = new activity.Biking(
				[lat, lng],
				distance,
				duration,
				elevation
			);
		}

		this.#workouts.push(workout);
		const marker = this._renderWorkoutMarker(workout);
		this.#markers.push(marker);
		this._renderWorkout(workout);
		this._hideForm();
		this._moveMapLocation(workout);
	}

	_deleteWorkout(button) {
		const workoutElement = button.closest('.workout');
		if (!workoutElement) return;

		const workoutId = workoutElement.dataset.id;

		const workoutIndex = this.#workouts.findIndex(
			(workout) => workout.id === workoutId
		);
		if (workoutIndex === -1) return;

		this.#workouts.splice(workoutIndex, 1);
		this.#markers[workoutIndex].remove();
		this.#markers.splice(workoutIndex, 1);

		workoutElement.remove();
	}

	_renderWorkoutMarker(workout) {
		const marker = L.marker(workout.coords)
			.addTo(this.#map)
			.bindPopup(
				L.popup({
					maxWidth: 250,
					minWidth: 100,
					autoClose: false,
					closeOnClick: false,
					className: `${workout.type}-popup`,
				})
			)
			.setPopupContent(
				`${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
					workout.description
				}`
			)
			.openPopup();
		return marker;
	}

	_renderWorkout(workout) {
		let html = `
    <li class="workout workout--${workout.type}" data-id="${workout.id}">
      <button class="close_buttons" type="button">x</button>
      <h2 class="workout__title">${workout.description}</h2>
      <div class="workout__details">
        <span class="workout__icon">${
			workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
		}</span>
        <span class="workout__value">${workout.distance}</span></span>
        <span class="workout__unit">mile</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${workout.duration}</span>
        <span class="workout__unit">min</span>
      </div>`;

		if (workout.type === 'running') {
			html += `
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/mile</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>`;
		}

		if (workout.type === 'biking') {
			html += `
      </div>
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">mile/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li> `;
		}

		form.insertAdjacentHTML('afterend', html);
	}

	_moveMapLocation(workout) {
		this.#map.setView(workout.coords, 13);
	}

	_moveToPopup(e) {
		const workoutEl = e.target.closest('.workout');

		if (!workoutEl) return;

		const workout = this.#workouts.find(
			(work) => work.id === workoutEl.getAttribute('data-id')
		);

		this.#map.setView(workout.coords, 13);
	}

	reset() {
		localStorage.removeItem('workouts');
		location.reload();
	}
}

const clientApp = new ClientApp();
