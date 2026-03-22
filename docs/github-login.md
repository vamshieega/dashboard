# GitHub login for `git push` (HTTPS)

GitHub **does not accept your account password** for Git over HTTPS. You must use a **Personal Access Token (PAT)** as the password.

If you see:

```text
remote: Invalid username or token. Password authentication is not supported for Git operations.
```

you are either using your GitHub **password** instead of a **token**, or the token is wrong / expired / missing `repo` scope.

---

## Login checklist (vamshieega account)

1. **Browser:** sign in to GitHub as **`vamshieega`** (the account that owns `vamshieega/dashboard`).

2. **Create a token:**  
   **Settings → Developer settings → Personal access tokens**  
   - **Fine-grained:** add token → repository access: **`vamshieega/dashboard`** → permissions: **Contents: Read and write** (and **Metadata: Read**).  
   - **Classic:** **Generate new token (classic)** → enable **`repo`** scope.

3. **Copy the token once** (you will not see it again). Do **not** commit it to this repo.

4. **Remote URL** (username embedded so Git knows who you are):

   ```bash
   git remote set-url origin 'https://vamshieega@github.com/vamshieega/dashboard.git'
   ```

5. **Push** (from the project root):

   ```bash
   git push -u origin main
   ```

6. When Git asks for a **password**, paste the **PAT** (not your GitHub password).  
   Username is already **`vamshieega`** in the URL above.

---

## Credential helper (`store`)

This machine may use `git config credential.helper store`, which saves credentials in **`~/.git-credentials`**. That file must **not** be committed. If login fails after a bad attempt, remove the `github.com` line from that file (or delete the file) and push again to re-enter the PAT.

---

## Wrong GitHub user (403)

If you see **Permission denied … to `krishnavamshieega`** while pushing **`vamshieega/dashboard`**, Git is still using another account’s saved token. Clear `github.com` credentials (Keychain and/or `~/.git-credentials`), set the remote URL with **`vamshieega@`** as above, then push with **`vamshieega`**’s PAT.

---

## Optional: SSH instead of HTTPS

If you add an SSH key to the **`vamshieega`** account:

```bash
git remote set-url origin 'git@github.com:vamshieega/dashboard.git'
```

Then `git push` uses SSH keys (no PAT in prompts). See GitHub: **Settings → SSH and GPG keys**.
