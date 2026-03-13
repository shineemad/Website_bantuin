# 🧪 TESTING GUIDE - Profile Badge System

## Quick Test Steps

### Method 1: Using test_badge_simple.html (RECOMMENDED)

1. **Buka file:** `test_badge_simple.html` di browser
2. **Klik:** "Test CLIENT Badge" atau "Test TALENT Badge"
3. **Lihat:** Badge preview akan muncul dengan warna yang sesuai
4. **Klik:** "Open Profile Page →"
5. **Verify:** Badge muncul di halaman profile dengan style yang sama

---

### Method 2: Manual Test

1. **Buka Console Browser** (Tekan F12)

2. **Paste kode ini untuk set CLIENT:**

```javascript
localStorage.setItem("rpl_currentRole", "client");
localStorage.setItem(
  "rpl_profile",
  JSON.stringify({
    name: "Test Client",
    email: "client@test.com",
    role: "client",
  })
);
console.log("✅ Client role set");
```

3. **Atau paste ini untuk set TALENT:**

```javascript
localStorage.setItem("rpl_currentRole", "talent");
localStorage.setItem(
  "rpl_profile",
  JSON.stringify({
    name: "Test Talent",
    email: "talent@test.com",
    role: "talent",
  })
);
console.log("✅ Talent role set");
```

4. **Buka:** `profile.html`

5. **Check Console untuk log:**
   - "Profile loaded - Current role: [role]"
   - "✅ Role badge created: [Client/Talent] with class: ..."

---

## Expected Results

### ✅ CLIENT Badge

- **Color:** Purple gradient (#667eea → #764ba2)
- **Icon:** 💼 Briefcase (fas fa-briefcase)
- **Text:** "Client"
- **Position:** Below name, above email

### ✅ TALENT Badge

- **Color:** Pink gradient (#f093fb → #f5576c)
- **Icon:** ⭐ Star (fas fa-star)
- **Text:** "Talent"
- **Position:** Below name, above email

### ✅ ADMIN Badge (if applicable)

- **Color:** Cyan gradient (#4facfe → #00f2fe)
- **Icon:** 🛡️ Shield (fas fa-shield-alt)
- **Text:** "Admin"

---

## Troubleshooting

### Badge tidak muncul?

**Check 1: Verify localStorage**

```javascript
// Paste in Console
console.log("Role:", localStorage.getItem("rpl_currentRole"));
console.log("Profile:", localStorage.getItem("rpl_profile"));
```

**Check 2: Check for errors**

- Open Console (F12)
- Look for red error messages
- Check for "roleBadgeContainer not found" warning

**Check 3: Verify HTML element exists**

```javascript
// Paste in Console (while on profile.html)
console.log("Container:", document.getElementById("roleBadgeContainer"));
```

**Check 4: Force reload**

- Press Ctrl + Shift + R (hard refresh)
- Clear cache: Ctrl + Shift + Delete

---

### Badge muncul tapi warna salah?

**Check CSS loading:**

```javascript
// Check if CSS loaded
const badge = document.querySelector(".role-badge");
if (badge) {
  console.log("Badge found:", badge.className);
  console.log("Computed style:", window.getComputedStyle(badge).background);
}
```

---

### Role tidak sesuai?

**Reset role:**

```javascript
// Clear all
localStorage.removeItem("rpl_currentRole");
localStorage.removeItem("rpl_profile");
localStorage.removeItem("bantuin_session");

// Set new role (client or talent)
localStorage.setItem("rpl_currentRole", "client"); // or 'talent'
```

---

## Console Debug Commands

### Check current state:

```javascript
console.log({
  role: localStorage.getItem("rpl_currentRole"),
  profile: JSON.parse(localStorage.getItem("rpl_profile") || "{}"),
  badgeContainer: !!document.getElementById("roleBadgeContainer"),
});
```

### Manually create badge:

```javascript
const container = document.getElementById("roleBadgeContainer");
const role = localStorage.getItem("rpl_currentRole") || "client";
const badge = document.createElement("div");
badge.className = "role-badge role-badge-" + role;
badge.innerHTML =
  '<i class="fas fa-' +
  (role === "client" ? "briefcase" : "star") +
  '"></i><span>' +
  (role === "client" ? "Client" : "Talent") +
  "</span>";
container.innerHTML = "";
container.appendChild(badge);
console.log("✅ Badge manually created");
```

---

## Files Modified

1. **profile.html**

   - Added CSS for `.role-badge`, `.role-badge-client`, `.role-badge-talent`
   - Added `<div id="roleBadgeContainer"></div>` in profile card

2. **assets/js/profile.js**

   - Added badge creation logic in `renderProfile()` function
   - Added retry mechanism for DOM element loading
   - Added console logging for debugging

3. **Test files created:**
   - `test_badge_simple.html` - Quick visual test
   - `test_badge_quick.html` - Step-by-step test guide
   - `test_profile_badge.html` - Comprehensive test suite

---

## Success Criteria

- ✅ Badge visible on profile page
- ✅ Correct color based on role
- ✅ Correct icon (briefcase/star)
- ✅ Smooth animation on load
- ✅ Console shows success logs
- ✅ No errors in console

---

## Test Checklist

- [ ] Open test_badge_simple.html
- [ ] Click "Test CLIENT Badge"
- [ ] Verify purple badge with briefcase appears
- [ ] Click "Open Profile Page"
- [ ] Verify badge appears in profile.html
- [ ] Check console for success logs
- [ ] Go back to test page
- [ ] Click "Test TALENT Badge"
- [ ] Verify pink badge with star appears
- [ ] Open profile page again
- [ ] Verify badge changed to talent style

---

## Quick Fix Commands

**If badge stuck/not updating:**

```javascript
// Force refresh badge
const container = document.getElementById("roleBadgeContainer");
if (container) container.innerHTML = "";
location.reload();
```

**If need to reset everything:**

```javascript
localStorage.clear();
location.reload();
```

---

## Contact

Jika masih ada masalah setelah mengikuti guide ini, check:

1. Browser console for specific error messages
2. Network tab untuk memastikan CSS/JS loaded
3. Elements tab untuk verify HTML structure

**Happy Testing! 🎉**
