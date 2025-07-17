# Final Deployment Checklist

This guide provides the definitive steps to fix the deployment issue. The core problem is that GitHub Pages is likely serving your site from the wrong branch (`main`) instead of the correct one (`gh-pages`).

Please follow these steps exactly.

---

### Step 1: Verify Your GitHub Pages Settings

1.  **Go to your Repository Settings.**
    Navigate to your `PortalWeb` repository on GitHub and click the "Settings" tab.

    ![Step 1](https://i.imgur.com/kYqR4q3.png)

2.  **Go to the "Pages" section.**
    In the left sidebar, click on "Pages".

    ![Step 2](https://i.imgur.com/G5g20g3.png)

3.  **Set the Correct Deployment Source.**
    - Under "Build and deployment", for the "Source", select **"Deploy from a branch"**.
    - In the branch dropdown menu that appears, select **`gh-pages`**.
    - Ensure the folder is set to `/ (root)`.
    - Click **"Save"**.

    It is **critical** that the branch is set to `gh-pages`. Your settings should look exactly like this:

    ![Step 3](https://i.imgur.com/8c3f4V8.png)

---

### Step 2: Force a Clean Redeployment

Pushing a small change will trigger the GitHub Action to run again, ensuring the latest build is deployed to the correct branch.

1.  **Make a small, trivial change.**
    You can add a space or a comment to the `README.md` file.

2.  **Commit and push the change.**
    ```bash
    git add .
    git commit -m "chore: Force redeployment"
    git push origin main
    ```

---

### Step 3: Monitor the Deployment

1.  **Go to the "Actions" tab** in your repository.
2.  You should see a new workflow running for your "chore: Force redeployment" commit.
3.  Wait for the workflow to complete successfully. It should have a green checkmark.

---

### Step 4: Clear Your Browser Cache (Critically Important)

This is the most important step. Your browser is likely holding on to a broken version of the site.

1.  **Open your deployed site** in your browser.
    [https://duvet13d.github.io/PortalWeb/](https://duvet13d.github.io/PortalWeb/)

2.  **Open the Developer Tools.**
    -   Press `F12` (or `Ctrl+Shift+I` on Windows, `Cmd+Opt+I` on Mac).

3.  **Perform a Hard Refresh and Empty Cache.**
    -   Go to the "Network" tab in the developer tools.
    -   Check the "Disable cache" box.
    -   Right-click the browser's refresh button and select **"Empty Cache and Hard Reload"**.

    ![Step 4](https://i.imgur.com/S5rN6hF.png)

4.  **Alternatively, use an incognito/private window**, as this will ignore any cached files.

---

### Why This is the Solution

-   **The `main` branch contains source code.** Its `index.html` points to `/src/main.jsx`, which is not a real JavaScript file and causes the MIME type errors.
-   **The `gh-pages` branch contains production code.** Its `index.html` points to the correctly bundled `/assets/index-....js` file.

By ensuring GitHub Pages deploys from `gh-pages`, you guarantee that the correct, production-ready version of your site is being served.

If you have followed these steps exactly, the issue will be resolved. 