# POS Calculator

This project is a single-page web application that functions as a Point-of-Sale (POS) style calculator. It is designed for small businesses needing to quickly calculate totals for items priced in two different currencies: US Dollars (USD) and Venezuelan Bolivars (Bs.).

The application is built with vanilla HTML, CSS, and JavaScript, with no external frameworks or libraries. It is a client-side only application that uses the browser's `localStorage` for data persistence.

**Key Features:**
- **Dual Currency Input:** Separate sections for adding line items priced in USD and Bs.
- **Real-time Calculation:** All totals and subtotals are updated automatically as values are changed.
- **Manual Exchange Rate:** A dedicated input for the user to set the USD to Bs. exchange rate.
- **Dynamic Rows:** Users can add and delete an unlimited number of line items for each currency.
- **Session Management:** Users can save the current state of a calculation, view a list of saved calculations, and load or delete them. This includes an "auto-save on reset" feature.
- **Dark/Light Theme:** A theme-switcher allows users to toggle between a light and dark mode.
- **Progressive Web App (PWA):** The application includes a service worker and a web manifest, allowing it to be "installed" on a desktop or mobile device and to function while offline.
- **Continuous Deployment:** The project is configured with a GitHub Actions workflow to automatically deploy to GitHub Pages when changes are pushed to the `main` branch.

## Building and Running

This is a static web project and does not have a complex build step.

### Running Locally

To run the application locally, you must serve the files from a local web server. The PWA features (like the service worker) will not work correctly if you open the `index.html` file directly from the filesystem (`file:///...`).

1.  Navigate to the project's root directory in your terminal.
2.  Run a simple HTTP server. The recommended method is using Python:
    ```bash
    python -m http.server
    ```
3.  Open your web browser and go to `http://localhost:8000`.

### Deployment

The project is set up for continuous deployment to GitHub Pages.

- **Trigger:** A `push` to the `main` branch will automatically trigger the deployment workflow.
- **Workflow File:** The deployment logic is defined in `.github/workflows/deploy.yml`.
- **Source:** The GitHub Pages site is configured to be deployed using "GitHub Actions".

## License

This project is licensed under the Creative Commons Attribution-NonCommercial 4.0 International License. See the [LICENSE](LICENSE) file for details.
