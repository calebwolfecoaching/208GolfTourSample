import { useState, useEffect, useCallback, useMemo } from "react";

const FONTS_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Outfit:wght@300;400;500;600;700;800&display=swap";

// --- DATA ---
const SAMPLE_PLAYERS = [
  { id: "208-0001", name: "Jake Morrison", email: "jake@email.com", phone: "208-555-0101", ghin: "1234567", registered: true, balance: 140, lifetimeWinnings: 420, pendingPayouts: 70 },
  { id: "208-0002", name: "Ryan Cooper", email: "ryan@email.com", phone: "208-555-0102", ghin: "2345678", registered: true, balance: 70, lifetimeWinnings: 210, pendingPayouts: 0 },
  { id: "208-0003", name: "Tyler Nash", email: "tyler@email.com", phone: "208-555-0103", ghin: "3456789", registered: true, balance: 0, lifetimeWinnings: 70, pendingPayouts: 0 },
  { id: "208-0004", name: "Derek Hall", email: "derek@email.com", phone: "208-555-0104", ghin: "4567890", registered: true, balance: 210, lifetimeWinnings: 560, pendingPayouts: 140 },
  { id: "208-0005", name: "Marcus Bell", email: "marcus@email.com", phone: "208-555-0105", ghin: "5678901", registered: true, balance: 35, lifetimeWinnings: 105, pendingPayouts: 0 },
  { id: "208-0006", name: "Sam Wilder", email: "sam@email.com", phone: "208-555-0106", ghin: "6789012", registered: true, balance: 0, lifetimeWinnings: 0, pendingPayouts: 0 },
];

const SAMPLE_TOURNAMENTS = [
  { id: "t1", name: "Falcon Crest Classic", dateRange: "March 22 – April 2", course: "Falcon Crest Golf Club", entryFee: 70, status: "leaderboard_visible", regOpen: false, submissionDeadline: "April 2, 11:59 PM", notes: "Cart included in entry fee.", payoutPlaces: 3, payoutAmounts: [50, 30, 20] },
  { id: "t2", name: "Ridgecrest Invitational", dateRange: "April 5 – April 16", course: "Ridgecrest Golf Club", entryFee: 70, status: "active", regOpen: false, submissionDeadline: "April 16, 11:59 PM", notes: "Walking only — no carts.", payoutPlaces: 3, payoutAmounts: [50, 30, 20] },
  { id: "t3", name: "Eagle Hills Open", dateRange: "April 19 – April 30", course: "Eagle Hills Golf Course", entryFee: 80, status: "upcoming", regOpen: true, submissionDeadline: "April 30, 11:59 PM", notes: "", payoutPlaces: 3, payoutAmounts: [50, 30, 20] },
  { id: "t4", name: "Boise River Scramble", dateRange: "May 3 – May 14", course: "Warm Springs Golf Course", entryFee: 70, status: "upcoming", regOpen: false, submissionDeadline: "May 14, 11:59 PM", notes: "Shotgun start available.", payoutPlaces: 3, payoutAmounts: [50, 30, 20] },
];

const SAMPLE_SCORES = [
  { playerId: "208-0001", tournamentId: "t1", netScore: 68, grossScore: 82, partner: "Ryan Cooper", verified: true },
  { playerId: "208-0002", tournamentId: "t1", netScore: 70, grossScore: 86, partner: "Jake Morrison", verified: true },
  { playerId: "208-0004", tournamentId: "t1", netScore: 71, grossScore: 83, partner: "Marcus Bell", verified: true },
  { playerId: "208-0005", tournamentId: "t1", netScore: 71, grossScore: 88, partner: "Derek Hall", verified: true },
  { playerId: "208-0003", tournamentId: "t1", netScore: 73, grossScore: 90, partner: "Sam Wilder", verified: true },
  { playerId: "208-0006", tournamentId: "t1", netScore: 75, grossScore: 91, partner: "Tyler Nash", verified: false },
  { playerId: "208-0001", tournamentId: "t2", netScore: 69, grossScore: 83, partner: "Derek Hall", verified: true },
  { playerId: "208-0004", tournamentId: "t2", netScore: 70, grossScore: 82, partner: "Jake Morrison", verified: true },
];

const SAMPLE_REGISTRATIONS = {
  t1: ["208-0001", "208-0002", "208-0003", "208-0004", "208-0005", "208-0006"],
  t2: ["208-0001", "208-0002", "208-0004", "208-0005"],
  t3: ["208-0001"],
};

const SAMPLE_NOTIFICATIONS = [
  { id: "n1", title: "Leaderboard Revealed!", message: "Falcon Crest Classic leaderboard is now live. Check your standings!", date: "Apr 3", read: false, type: "leaderboard" },
  { id: "n2", title: "New Tournament Posted", message: "Eagle Hills Open registration is now open. $80 entry fee.", date: "Apr 1", read: false, type: "tournament" },
  { id: "n3", title: "Score Verified", message: "Your Ridgecrest Invitational score has been verified by admin.", date: "Mar 30", read: true, type: "score" },
  { id: "n4", title: "Payout Credited", message: "$70 credited to your wallet from Falcon Crest Classic (2nd place).", date: "Apr 3", read: true, type: "payout" },
];

const SAMPLE_TRANSACTIONS = [
  { id: "tx1", type: "entry", desc: "Falcon Crest Classic — Entry Fee", amount: -70, date: "Mar 20" },
  { id: "tx2", type: "winning", desc: "Falcon Crest Classic — 1st Place", amount: 175, date: "Apr 3" },
  { id: "tx3", type: "entry", desc: "Ridgecrest Invitational — Entry Fee", amount: -70, date: "Apr 3" },
  { id: "tx4", type: "entry", desc: "Eagle Hills Open — Entry Fee", amount: -80, date: "Apr 10" },
  { id: "tx5", type: "cashout", desc: "Cash Out to Bank", amount: -50, date: "Apr 5" },
];

// --- ICONS (inline SVG) ---
const Icon = ({ name, size = 20, color = "currentColor" }) => {
  const paths = {
    home: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />,
    trophy: <path d="M8 21h8m-4-4v4m-4.5-9.5L5 7h2V3h10v4h2l-2.5 4.5M7 11a5 5 0 0010 0" />,
    calendar: <><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></>,
    clipboard: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />,
    user: <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    wallet: <path d="M3 10h18V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2v-4M3 10v8m18-8v8m-5-4h.01" />,
    bell: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-5-5.917V4a1 1 0 10-2 0v1.083A6 6 0 006 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
    shield: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />,
    check: <path d="M5 13l4 4L19 7" />,
    x: <path d="M6 18L18 6M6 6l12 12" />,
    chevron: <path d="M9 5l7 7-7 7" />,
    upload: <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />,
    star: <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />,
    settings: <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />,
    logout: <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />,
    dollar: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    eye: <><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>,
    flag: <path d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2z" />,
    plus: <path d="M12 4v16m8-8H4" />,
    edit: <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />,
    users: <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />,
    arrowDown: <path d="M19 14l-7 7m0 0l-7-7m7 7V3" />,
    arrowUp: <path d="M5 10l7-7m0 0l7 7m-7-7v18" />,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
  );
};

// --- STATUS BADGE ---
const StatusBadge = ({ status }) => {
  const map = {
    upcoming: { label: "Upcoming", bg: "#E8F4FD", color: "#1B6FA0", border: "#B8DDF0" },
    active: { label: "Active", bg: "#E6F9ED", color: "#18794E", border: "#A8E6C3" },
    closed: { label: "Closed", bg: "#FEF3E2", color: "#A35C00", border: "#FCD9A8" },
    leaderboard_visible: { label: "Results Live", bg: "#F0E8FD", color: "#6B35A0", border: "#D4B8F0" },
  };
  const s = map[status] || map.upcoming;
  return <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600, letterSpacing: 0.3, background: s.bg, color: s.color, border: `1px solid ${s.border}`, textTransform: "uppercase" }}>{s.label}</span>;
};

// --- MAIN APP ---
export default function App() {
  const [page, setPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [tournaments, setTournaments] = useState(SAMPLE_TOURNAMENTS);
  const [registrations, setRegistrations] = useState(SAMPLE_REGISTRATIONS);
  const [scores, setScores] = useState(SAMPLE_SCORES);
  const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const currentPlayer = user ? SAMPLE_PLAYERS.find(p => p.email === user.email) || SAMPLE_PLAYERS[0] : null;

  const navigate = useCallback((pg, data) => {
    if (data) setSelectedTournament(data);
    setPage(pg);
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = FONTS_URL;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Auth pages
  if (!user) {
    if (page === "signup") return <SignupPage onNavigate={navigate} onSignup={(u) => { setUser(u); navigate("dashboard"); }} showToast={showToast} toast={toast} />;
    if (page === "login") return <LoginPage onNavigate={navigate} onLogin={(u, admin) => { setUser(u); setIsAdmin(admin); navigate("dashboard"); }} showToast={showToast} toast={toast} />;
    if (page === "forgot") return <ForgotPage onNavigate={navigate} showToast={showToast} toast={toast} />;
    return <LandingPage onNavigate={navigate} />;
  }

  // Admin
  if (isAdmin && page === "admin") return (
    <AdminDashboard
      tournaments={tournaments}
      setTournaments={setTournaments}
      players={SAMPLE_PLAYERS}
      registrations={registrations}
      scores={scores}
      setScores={setScores}
      onNavigate={navigate}
      showToast={showToast}
      toast={toast}
    />
  );

  // Logged-in pages
  const pageMap = {
    dashboard: <Dashboard player={currentPlayer} tournaments={tournaments} registrations={registrations} scores={scores} unreadCount={unreadCount} onNavigate={navigate} isAdmin={isAdmin} />,
    schedule: <SchedulePage tournaments={tournaments} onNavigate={navigate} registrations={registrations} playerId={currentPlayer?.id} />,
    leaderboard_list: <LeaderboardList tournaments={tournaments} onNavigate={navigate} />,
    leaderboard: <LeaderboardPage tournament={selectedTournament} scores={scores} players={SAMPLE_PLAYERS} onNavigate={navigate} />,
    register_tournament: <RegisterTournament tournament={selectedTournament} player={currentPlayer} registrations={registrations} setRegistrations={setRegistrations} onNavigate={navigate} showToast={showToast} />,
    submit_score: <SubmitScore tournaments={tournaments} player={currentPlayer} registrations={registrations} scores={scores} setScores={setScores} players={SAMPLE_PLAYERS} onNavigate={navigate} showToast={showToast} />,
    rules: <RulesPage onNavigate={navigate} />,
    profile: <ProfilePage player={currentPlayer} onNavigate={navigate} onLogout={() => { setUser(null); setIsAdmin(false); navigate("landing"); }} />,
    notifications: <NotificationsPage notifications={notifications} setNotifications={setNotifications} onNavigate={navigate} />,
    wallet: <WalletPage player={currentPlayer} transactions={SAMPLE_TRANSACTIONS} onNavigate={navigate} showToast={showToast} />,
  };

  return (
    <div style={styles.appWrap}>
      <div style={styles.pageContent}>
        {pageMap[page] || pageMap.dashboard}
      </div>
      <BottomNav page={page} onNavigate={navigate} unreadCount={unreadCount} isAdmin={isAdmin} />
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

// --- TOAST ---
const Toast = ({ msg, type }) => (
  <div style={{ position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: type === "success" ? "#18794E" : type === "error" ? "#C13838" : "#1B6FA0", color: "#fff", padding: "12px 24px", borderRadius: 12, fontSize: 14, fontWeight: 500, fontFamily: "'DM Sans', sans-serif", boxShadow: "0 8px 32px rgba(0,0,0,0.18)", maxWidth: "90vw" }}>{msg}</div>
);

// --- BOTTOM NAV ---
const BottomNav = ({ page, onNavigate, unreadCount, isAdmin }) => {
  const items = [
    { id: "dashboard", icon: "home", label: "Home" },
    { id: "schedule", icon: "calendar", label: "Schedule" },
    { id: "leaderboard_list", icon: "trophy", label: "Leaders" },
    { id: "notifications", icon: "bell", label: "Alerts" },
    { id: isAdmin ? "admin" : "profile", icon: isAdmin ? "settings" : "user", label: isAdmin ? "Admin" : "Profile" },
  ];
  return (
    <nav style={styles.bottomNav}>
      {items.map(it => {
        const active = page === it.id || (it.id === "leaderboard_list" && page === "leaderboard");
        return (
          <button key={it.id} onClick={() => onNavigate(it.id)} style={{ ...styles.navBtn, color: active ? "#1A5D3A" : "#8A8A8A" }}>
            <div style={{ position: "relative" }}>
              <Icon name={it.icon} size={22} />
              {it.id === "notifications" && unreadCount > 0 && (
                <span style={styles.badge}>{unreadCount}</span>
              )}
            </div>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, marginTop: 2 }}>{it.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

// --- LANDING ---
const LandingPage = ({ onNavigate }) => (
  <div style={styles.landing}>
    <div style={styles.landingBg}>
      <div style={styles.landingOverlay} />
      <div style={styles.landingContent}>
        <div style={styles.logoMark}>208 <span style={{ fontWeight: 300 }}>Golf Tour</span></div>
        <p style={styles.landingTag}>Idaho's premier recreational golf tour</p>
        <p style={styles.landingDesc}>Compete across Idaho's finest courses in biweekly mini tournaments. Track your scores, climb the leaderboard, and win payouts.</p>
        <button style={styles.primaryBtn} onClick={() => onNavigate("signup")}>Get Started</button>
        <button style={styles.ghostBtn} onClick={() => onNavigate("login")}>Already a member? Sign in</button>
      </div>
    </div>
  </div>
);

// --- AUTH PAGES ---
const AuthShell = ({ children, title, subtitle, toast: t }) => (
  <div style={styles.authWrap}>
    {t && <Toast msg={t.msg} type={t.type} />}
    <div style={styles.authCard}>
      <div style={styles.authLogo}>208 <span style={{ fontWeight: 300 }}>Golf Tour</span></div>
      <h2 style={styles.authTitle}>{title}</h2>
      {subtitle && <p style={styles.authSub}>{subtitle}</p>}
      {children}
    </div>
  </div>
);

const Input = ({ label, type = "text", placeholder, value, onChange, required }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={styles.label}>{label}{required && <span style={{ color: "#C13838" }}> *</span>}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)} style={styles.input} />
  </div>
);

const SignupPage = ({ onNavigate, onSignup, showToast, toast }) => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", ghin: "", password: "" });
  const [ghinFile, setGhinFile] = useState(null);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const submit = () => {
    if (!form.name || !form.email || !form.password || !form.ghin) { showToast("Please fill all required fields", "error"); return; }
    showToast("Account created! Welcome to 208 Golf Tour.");
    onSignup({ email: form.email, name: form.name });
  };
  return (
    <AuthShell title="Join the Tour" subtitle="Create your account and player profile" toast={toast}>
      <Input label="Full Name" placeholder="Jake Morrison" value={form.name} onChange={v => set("name", v)} required />
      <Input label="Email" type="email" placeholder="jake@email.com" value={form.email} onChange={v => set("email", v)} required />
      <Input label="Phone Number" type="tel" placeholder="208-555-0101" value={form.phone} onChange={v => set("phone", v)} />
      <Input label="GHIN Number" placeholder="1234567" value={form.ghin} onChange={v => set("ghin", v)} required />
      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>GHIN Profile Screenshot</label>
        <label style={styles.uploadBox}>
          <Icon name="upload" size={20} color="#8A8A8A" />
          <span style={{ fontSize: 13, color: "#8A8A8A" }}>{ghinFile ? ghinFile : "Tap to upload screenshot"}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setGhinFile(e.target.files[0]?.name || null)} />
        </label>
      </div>
      <Input label="Password" type="password" placeholder="••••••••" value={form.password} onChange={v => set("password", v)} required />
      <button style={styles.primaryBtn} onClick={submit}>Create Account</button>
      <p style={styles.authLink}>Already a member? <span style={styles.link} onClick={() => onNavigate("login")}>Sign in</span></p>
    </AuthShell>
  );
};

const LoginPage = ({ onNavigate, onLogin, showToast, toast }) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const submit = () => {
    if (email.toLowerCase() === "admin") { onLogin({ email: "admin@208golf.com", name: "Admin" }, true); return; }
    if (!email || !pw) { showToast("Enter email and password", "error"); return; }
    onLogin({ email, name: email.split("@")[0] }, false);
  };
  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your 208 Golf Tour account" toast={toast}>
      <Input label="Email" type="email" placeholder="jake@email.com" value={email} onChange={setEmail} required />
      <Input label="Password" type="password" placeholder="••••••••" value={pw} onChange={setPw} required />
      <button style={styles.primaryBtn} onClick={submit}>Sign In</button>
      <p style={styles.authLink}><span style={styles.link} onClick={() => onNavigate("forgot")}>Forgot password?</span></p>
      <p style={styles.authLink}>New here? <span style={styles.link} onClick={() => onNavigate("signup")}>Create account</span></p>
      <p style={{ fontSize: 11, color: "#AAA", textAlign: "center", marginTop: 8 }}>Demo: type "admin" as email for admin view</p>
    </AuthShell>
  );
};

const ForgotPage = ({ onNavigate, showToast, toast }) => {
  const [email, setEmail] = useState("");
  return (
    <AuthShell title="Reset Password" subtitle="We'll send you a reset link" toast={toast}>
      <Input label="Email" type="email" placeholder="jake@email.com" value={email} onChange={setEmail} required />
      <button style={styles.primaryBtn} onClick={() => { showToast("Reset link sent! Check your email."); setTimeout(() => onNavigate("login"), 1500); }}>Send Reset Link</button>
      <p style={styles.authLink}><span style={styles.link} onClick={() => onNavigate("login")}>Back to sign in</span></p>
    </AuthShell>
  );
};

// --- DASHBOARD ---
const Dashboard = ({ player, tournaments, registrations, scores, unreadCount, onNavigate, isAdmin }) => {
  const activeTourney = tournaments.find(t => t.status === "active");
  const myScoreSubmitted = activeTourney && scores.some(s => s.playerId === player?.id && s.tournamentId === activeTourney.id);
  const isRegistered = activeTourney && (registrations[activeTourney.id] || []).includes(player?.id);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <div style={styles.logoSmall}>208 <span style={{ fontWeight: 300 }}>Golf Tour</span></div>
          <h1 style={styles.pageTitle}>Welcome back, {player?.name?.split(" ")[0]}</h1>
          <p style={styles.muted}>Player ID: <span style={{ fontWeight: 600, color: "#1A5D3A" }}>{player?.id}</span></p>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => onNavigate("notifications")} style={styles.alertBtn}>
            <Icon name="bell" size={18} />
            <span style={styles.alertBadge}>{unreadCount}</span>
          </button>
        )}
      </div>

      {/* Wallet Summary */}
      <div style={styles.walletCard} onClick={() => onNavigate("wallet")}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff", opacity: 0.8 }}>Wallet Balance</span>
          <Icon name="chevron" size={16} color="rgba(255,255,255,0.6)" />
        </div>
        <div style={{ fontSize: 32, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif" }}>${player?.balance || 0}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Lifetime: <b style={{ color: "#fff" }}>${player?.lifetimeWinnings || 0}</b></span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>Pending: <b style={{ color: "#fff" }}>${player?.pendingPayouts || 0}</b></span>
        </div>
      </div>

      {/* Active Tournament */}
      {activeTourney && (
        <div style={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#8A8A8A", textTransform: "uppercase", letterSpacing: 1 }}>Active Tournament</span>
            <StatusBadge status="active" />
          </div>
          <h3 style={styles.cardTitle}>{activeTourney.name}</h3>
          <p style={styles.cardMeta}>{activeTourney.course} · {activeTourney.dateRange}</p>
          <p style={{ fontSize: 12, color: "#999", marginTop: 4 }}>Deadline: {activeTourney.submissionDeadline}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            {!isRegistered ? (
              <button style={styles.primaryBtnSm} onClick={() => onNavigate("register_tournament", activeTourney)}>Register — ${activeTourney.entryFee}</button>
            ) : !myScoreSubmitted ? (
              <button style={styles.primaryBtnSm} onClick={() => onNavigate("submit_score")}>Submit Score</button>
            ) : (
              <span style={{ fontSize: 13, color: "#18794E", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Icon name="check" size={16} color="#18794E" /> Score Submitted</span>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div style={styles.gridTwo}>
        <button style={styles.actionCard} onClick={() => onNavigate("schedule")}>
          <Icon name="calendar" size={24} color="#1A5D3A" />
          <span style={styles.actionLabel}>Schedule</span>
        </button>
        <button style={styles.actionCard} onClick={() => onNavigate("leaderboard_list")}>
          <Icon name="trophy" size={24} color="#1A5D3A" />
          <span style={styles.actionLabel}>Leaderboards</span>
        </button>
        <button style={styles.actionCard} onClick={() => onNavigate("submit_score")}>
          <Icon name="clipboard" size={24} color="#1A5D3A" />
          <span style={styles.actionLabel}>Submit Score</span>
        </button>
        <button style={styles.actionCard} onClick={() => onNavigate("rules")}>
          <Icon name="shield" size={24} color="#1A5D3A" />
          <span style={styles.actionLabel}>Rules</span>
        </button>
      </div>

      {isAdmin && (
        <button style={{ ...styles.primaryBtn, background: "#333", marginTop: 8 }} onClick={() => onNavigate("admin")}>
          <Icon name="settings" size={16} color="#fff" /> Open Admin Panel
        </button>
      )}
    </div>
  );
};

// --- WALLET ---
const WalletPage = ({ player, transactions, onNavigate, showToast }) => (
  <div style={styles.page}>
    <button style={styles.backBtn} onClick={() => onNavigate("dashboard")}>← Back</button>
    <h1 style={styles.pageTitle}>Wallet</h1>

    <div style={styles.walletCard}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Available Balance</span>
      <div style={{ fontSize: 40, fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif", margin: "4px 0" }}>${player?.balance || 0}</div>
      <div style={{ display: "flex", gap: 20, marginTop: 8 }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Lifetime: <b style={{ color: "#fff" }}>${player?.lifetimeWinnings}</b></span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)" }}>Pending: <b style={{ color: "#fff" }}>${player?.pendingPayouts}</b></span>
      </div>
    </div>

    <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
      <button style={{ ...styles.primaryBtnSm, flex: 1 }} onClick={() => showToast("Cash out requested! Funds will arrive in 2-3 business days.")}>Cash Out</button>
      <button style={{ ...styles.outlineBtnSm, flex: 1 }} onClick={() => showToast("Balance applied to next entry fee.", "info")}>Use for Entry</button>
    </div>

    <h3 style={{ ...styles.sectionTitle, marginTop: 24 }}>Transaction History</h3>
    {transactions.map(tx => (
      <div key={tx.id} style={styles.txRow}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#222" }}>{tx.desc}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{tx.date}</div>
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: tx.amount > 0 ? "#18794E" : "#C13838" }}>
          {tx.amount > 0 ? "+" : ""}{tx.amount < 0 ? "−" : ""}${Math.abs(tx.amount)}
        </span>
      </div>
    ))}
  </div>
);

// --- SCHEDULE ---
const SchedulePage = ({ tournaments, onNavigate, registrations, playerId }) => {
  const grouped = { upcoming: [], active: [], leaderboard_visible: [], closed: [] };
  tournaments.forEach(t => (grouped[t.status] || grouped.upcoming).push(t));
  const order = ["active", "upcoming", "leaderboard_visible", "closed"];
  const labels = { active: "Active", upcoming: "Upcoming", leaderboard_visible: "Completed", closed: "Closed" };

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Schedule & Events</h1>
      {order.map(status => grouped[status].length > 0 && (
        <div key={status}>
          <h3 style={styles.sectionTitle}>{labels[status]}</h3>
          {grouped[status].map(t => {
            const isReg = (registrations[t.id] || []).includes(playerId);
            return (
              <div key={t.id} style={styles.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <h3 style={styles.cardTitle}>{t.name}</h3>
                    <p style={styles.cardMeta}>{t.course}</p>
                    <p style={styles.cardMeta}>{t.dateRange} · Entry: ${t.entryFee}</p>
                    <p style={{ fontSize: 12, color: "#999" }}>Deadline: {t.submissionDeadline}</p>
                    {t.notes && <p style={{ fontSize: 12, color: "#888", marginTop: 4, fontStyle: "italic" }}>{t.notes}</p>}
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {t.regOpen && !isReg && <button style={styles.primaryBtnSm} onClick={() => onNavigate("register_tournament", t)}>Register</button>}
                  {isReg && <span style={{ fontSize: 12, color: "#18794E", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}><Icon name="check" size={14} color="#18794E" /> Registered</span>}
                  {t.status === "leaderboard_visible" && <button style={styles.outlineBtnSm} onClick={() => onNavigate("leaderboard", t)}>View Results</button>}
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// --- REGISTER TOURNAMENT ---
const RegisterTournament = ({ tournament, player, registrations, setRegistrations, onNavigate, showToast }) => {
  const [confirmed, setConfirmed] = useState(false);
  const t = tournament;
  if (!t) return <div style={styles.page}><p>No tournament selected.</p><button style={styles.outlineBtnSm} onClick={() => onNavigate("schedule")}>View Schedule</button></div>;
  const isReg = (registrations[t.id] || []).includes(player?.id);

  const handleRegister = () => {
    setRegistrations(r => ({ ...r, [t.id]: [...(r[t.id] || []), player?.id] }));
    setConfirmed(true);
    showToast("Registered! You're in.");
  };

  if (confirmed || isReg) return (
    <div style={styles.page}>
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={styles.successCircle}><Icon name="check" size={32} color="#18794E" /></div>
        <h2 style={{ ...styles.pageTitle, marginTop: 16 }}>You're Registered!</h2>
        <p style={styles.muted}>{t.name}</p>
        <p style={styles.muted}>{t.dateRange}</p>
        <div style={{ ...styles.card, marginTop: 24, background: "#FFFBEB", border: "1px solid #FDE68A" }}>
          <p style={{ fontSize: 13, color: "#92400E", fontWeight: 500, margin: 0 }}>⚠️ Remember: You must play with another 208 Golf Tour member who is also registered in this tournament.</p>
        </div>
        <button style={{ ...styles.primaryBtn, marginTop: 24 }} onClick={() => onNavigate("dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => onNavigate("schedule")}>← Back</button>
      <h1 style={styles.pageTitle}>Register for Tournament</h1>
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>{t.name}</h3>
        <p style={styles.cardMeta}>{t.course}</p>
        <p style={styles.cardMeta}>{t.dateRange}</p>
        <p style={{ fontSize: 12, color: "#999", marginBottom: 4 }}>Submission Deadline: {t.submissionDeadline}</p>
        <div style={{ borderTop: "1px solid #eee", marginTop: 16, paddingTop: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, fontWeight: 600 }}>
            <span>Entry Fee</span>
            <span style={{ color: "#1A5D3A", fontFamily: "'Outfit', sans-serif" }}>${t.entryFee}</span>
          </div>
        </div>
      </div>
      <div style={{ ...styles.card, background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
        <p style={{ fontSize: 13, color: "#166534", margin: 0, lineHeight: 1.5 }}>
          <strong>Partner Requirement:</strong> You must play your round with another 208 Golf Tour member who is also registered in this tournament. Both players must submit scores independently.
        </p>
      </div>
      <button style={styles.primaryBtn} onClick={handleRegister}>Pay ${t.entryFee} & Register</button>
    </div>
  );
};

// --- SUBMIT SCORE ---
const SubmitScore = ({ tournaments, player, registrations, scores, setScores, players, onNavigate, showToast }) => {
  const activeTournaments = tournaments.filter(t => t.status === "active" && (registrations[t.id] || []).includes(player?.id));
  const [selT, setSelT] = useState("");
  const [netScore, setNetScore] = useState("");
  const [grossScore, setGrossScore] = useState("");
  const [partner, setPartner] = useState("");
  const [file, setFile] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const regPlayers = selT ? (registrations[selT] || []).filter(pid => pid !== player?.id).map(pid => players.find(p => p.id === pid)).filter(Boolean) : [];

  const submit = () => {
    if (!selT || !netScore || !grossScore || !partner || !file) { showToast("Please fill all fields and upload screenshot", "error"); return; }
    setScores(s => [...s, { playerId: player?.id, tournamentId: selT, netScore: Number(netScore), grossScore: Number(grossScore), partner, verified: false }]);
    setSubmitted(true);
    showToast("Score submitted! Pending admin verification.");
  };

  if (submitted) return (
    <div style={styles.page}>
      <div style={{ textAlign: "center", padding: "40px 0" }}>
        <div style={styles.successCircle}><Icon name="check" size={32} color="#18794E" /></div>
        <h2 style={{ ...styles.pageTitle, marginTop: 16 }}>Score Submitted!</h2>
        <p style={styles.muted}>Your score is pending admin verification.</p>
        <button style={{ ...styles.primaryBtn, marginTop: 24 }} onClick={() => onNavigate("dashboard")}>Back to Dashboard</button>
      </div>
    </div>
  );

  if (activeTournaments.length === 0) return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => onNavigate("dashboard")}>← Back</button>
      <h1 style={styles.pageTitle}>Submit Score</h1>
      <div style={styles.emptyState}>
        <Icon name="clipboard" size={40} color="#CCC" />
        <p style={{ fontSize: 14, color: "#999", marginTop: 12 }}>No active tournaments you're registered for.</p>
        <button style={styles.outlineBtnSm} onClick={() => onNavigate("schedule")}>View Schedule</button>
      </div>
    </div>
  );

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => onNavigate("dashboard")}>← Back</button>
      <h1 style={styles.pageTitle}>Submit Score</h1>

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Tournament *</label>
        <select style={styles.select} value={selT} onChange={e => { setSelT(e.target.value); setPartner(""); }}>
          <option value="">Select tournament</option>
          {activeTournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Final Net Score *</label>
        <input type="number" placeholder="e.g. 72" value={netScore} onChange={e => setNetScore(e.target.value)} style={styles.input} />
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Enter your final net score as shown on your GHIN scorecard.</p>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Gross Score (for tiebreakers) *</label>
        <input type="number" placeholder="e.g. 86" value={grossScore} onChange={e => setGrossScore(e.target.value)} style={styles.input} />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={styles.label}>Playing Partner *</label>
        <select style={styles.select} value={partner} onChange={e => setPartner(e.target.value)} disabled={!selT}>
          <option value="">{selT ? "Select partner" : "Select tournament first"}</option>
          {regPlayers.map(p => <option key={p.id} value={p.name}>{p.name} ({p.id})</option>)}
        </select>
        <p style={{ fontSize: 11, color: "#999", marginTop: 4 }}>Partner must be registered in the same tournament.</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={styles.label}>GHIN Scorecard Screenshot *</label>
        <label style={styles.uploadBox}>
          <Icon name="upload" size={20} color={file ? "#18794E" : "#8A8A8A"} />
          <span style={{ fontSize: 13, color: file ? "#18794E" : "#8A8A8A" }}>{file ? file : "Tap to upload screenshot"}</span>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => setFile(e.target.files[0]?.name || null)} />
        </label>
        <p style={{ fontSize: 11, color: "#C13838", marginTop: 4 }}>Screenshot is required for score validation.</p>
      </div>

      <button style={styles.primaryBtn} onClick={submit}>Submit Final Net Score</button>
    </div>
  );
};

// --- LEADERBOARD LIST ---
const LeaderboardList = ({ tournaments, onNavigate }) => {
  const visible = tournaments.filter(t => t.status === "leaderboard_visible");
  const active = tournaments.filter(t => t.status === "active");
  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Leaderboards</h1>
      {active.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>Active Tournaments</h3>
          {active.map(t => (
            <div key={t.id} style={{ ...styles.card, background: "#F9FAFB" }}>
              <h3 style={styles.cardTitle}>{t.name}</h3>
              <p style={styles.cardMeta}>{t.dateRange}</p>
              <div style={{ ...styles.card, background: "#FFFBEB", border: "1px solid #FDE68A", marginTop: 12, padding: "12px 16px" }}>
                <p style={{ fontSize: 13, color: "#92400E", margin: 0 }}>🔒 Leaderboard will be revealed after the mini tournament closes.</p>
              </div>
            </div>
          ))}
        </>
      )}
      {visible.length > 0 && (
        <>
          <h3 style={styles.sectionTitle}>Results</h3>
          {visible.map(t => (
            <div key={t.id} style={styles.card} onClick={() => onNavigate("leaderboard", t)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={styles.cardTitle}>{t.name}</h3>
                  <p style={styles.cardMeta}>{t.dateRange}</p>
                </div>
                <Icon name="chevron" size={20} color="#CCC" />
              </div>
            </div>
          ))}
        </>
      )}
      {visible.length === 0 && active.length === 0 && (
        <div style={styles.emptyState}>
          <Icon name="trophy" size={40} color="#CCC" />
          <p style={{ fontSize: 14, color: "#999", marginTop: 12 }}>No leaderboards available yet.</p>
        </div>
      )}
    </div>
  );
};

// --- LEADERBOARD ---
const LeaderboardPage = ({ tournament, scores, players, onNavigate }) => {
  if (!tournament) return <div style={styles.page}><p>No tournament selected.</p></div>;
  const tScores = scores
    .filter(s => s.tournamentId === tournament.id && s.verified)
    .sort((a, b) => a.netScore - b.netScore || a.grossScore - b.grossScore);

  const medalColors = ["#D4AF37", "#A0A0A0", "#CD7F32"];

  return (
    <div style={styles.page}>
      <button style={styles.backBtn} onClick={() => onNavigate("leaderboard_list")}>← Back</button>
      <h1 style={styles.pageTitle}>{tournament.name}</h1>
      <p style={styles.muted}>{tournament.course} · {tournament.dateRange}</p>

      {tScores.length === 0 ? (
        <div style={styles.emptyState}><p style={{ color: "#999" }}>No verified scores yet.</p></div>
      ) : (
        <div style={{ marginTop: 16 }}>
          {/* Podium for top 3 */}
          {tScores.length >= 3 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 8, marginBottom: 24 }}>
              {[1, 0, 2].map(i => {
                const s = tScores[i];
                const p = players.find(pl => pl.id === s.playerId);
                const heights = [120, 90, 70];
                return (
                  <div key={i} style={{ textAlign: "center", width: 90 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 4 }}>{p?.name?.split(" ")[0]}</div>
                    <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#1A5D3A" }}>{s.netScore}</div>
                    <div style={{ height: heights[i], background: `linear-gradient(180deg, ${medalColors[i]}33, ${medalColors[i]}11)`, borderRadius: "8px 8px 0 0", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", border: `1px solid ${medalColors[i]}44`, borderBottom: "none" }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: medalColors[i], fontFamily: "'Outfit', sans-serif" }}>{i === 0 ? "1" : i === 1 ? "2" : "3"}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Full table */}
          <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid #eee" }}>
            <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 70px 70px", padding: "10px 12px", background: "#F9FAFB", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 }}>
              <span>#</span><span>Player</span><span style={{ textAlign: "right" }}>Net</span><span style={{ textAlign: "right" }}>Gross</span>
            </div>
            {tScores.map((s, i) => {
              const p = players.find(pl => pl.id === s.playerId);
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 70px 70px", padding: "12px", borderTop: "1px solid #f0f0f0", background: i < 3 ? "#FAFFF5" : "#fff" }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: i < 3 ? medalColors[i] : "#888", fontFamily: "'Outfit', sans-serif" }}>{i + 1}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>{p?.name}</div>
                    <div style={{ fontSize: 11, color: "#999" }}>{p?.id}</div>
                  </div>
                  <span style={{ textAlign: "right", fontSize: 16, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#1A5D3A" }}>{s.netScore}</span>
                  <span style={{ textAlign: "right", fontSize: 14, color: "#888" }}>{s.grossScore}</span>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: 11, color: "#AAA", textAlign: "center", marginTop: 8 }}>Ties broken by lowest gross score.</p>
        </div>
      )}
    </div>
  );
};

// --- RULES ---
const RulesPage = ({ onNavigate }) => {
  const [openSection, setOpenSection] = useState(null);
  const sections = [
    { title: "General Play Rules", content: "All rounds must be played on the designated course during the tournament date range. Players must play from the tees assigned by their handicap index. All rounds must be played with at least one other 208 Golf Tour member who is registered in the same tournament." },
    { title: "PGA / USGA Rules", content: "All play follows the current USGA Rules of Golf unless modified by the league-specific rules below. Pace of play should target 4 hours 15 minutes for 18 holes. Players are expected to maintain proper course etiquette at all times." },
    { title: "League-Specific Rules", content: "Out of Bounds: On all OB shots, the player must take lateral relief from the point where the ball last crossed the OB boundary line. Drop in the nearest fairway area, no closer to the hole, within two club lengths of the fairway edge at the point lateral to where the ball crossed OB. One stroke penalty applies.\n\nLost Ball: If a ball is lost (not OB), the same lateral relief procedure applies. Drop in the nearest fairway area lateral to the estimated point where the ball was lost. One stroke penalty.\n\nMax Score: Double bogey maximum on any hole for handicap/net scoring purposes." },
    { title: "Score Submission Rules", content: "All scores must be posted through GHIN before submitting to the tour. Submit your FINAL NET SCORE as calculated by GHIN. A screenshot of your GHIN scorecard is required with every submission. Scores submitted without a screenshot will not be verified. Scores must be submitted before the posted deadline for each tournament." },
    { title: "Partner Requirement", content: "Every round must be played with at least one other 208 Golf Tour member who is registered in the same mini tournament. Both players must submit scores independently. Rounds played solo or with non-members do not qualify." },
    { title: "Handicaps & Eligibility", content: "All players must maintain a valid GHIN handicap index. Handicap index used will be the index on the day of play. Players are responsible for ensuring their GHIN profile is current and accurate." },
    { title: "Payouts & Wallet", content: "Payouts are calculated based on final verified leaderboard standings. The admin sets payout places and percentages for each tournament. Winnings are credited to your 208 Golf Tour wallet. You may cash out to your bank or use your balance toward future entry fees." },
  ];

  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Rules & Policies</h1>
      <p style={styles.muted}>208 Golf Tour official rules. Modified USGA rules apply.</p>
      {sections.map((s, i) => (
        <div key={i} style={{ ...styles.card, padding: 0, marginBottom: 8, overflow: "hidden" }}>
          <button onClick={() => setOpenSection(openSection === i ? null : i)} style={{ width: "100%", padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#222" }}>{s.title}</span>
            <span style={{ transform: openSection === i ? "rotate(90deg)" : "none", transition: "transform 0.2s", color: "#999" }}><Icon name="chevron" size={16} /></span>
          </button>
          {openSection === i && (
            <div style={{ padding: "0 16px 16px", fontSize: 14, lineHeight: 1.7, color: "#555", whiteSpace: "pre-line" }}>{s.content}</div>
          )}
        </div>
      ))}
    </div>
  );
};

// --- PROFILE ---
const ProfilePage = ({ player, onNavigate, onLogout }) => (
  <div style={styles.page}>
    <h1 style={styles.pageTitle}>Profile</h1>
    <div style={styles.card}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #1A5D3A, #2D8F5E)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 20, fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>
          {player?.name?.split(" ").map(n => n[0]).join("")}
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{player?.name}</div>
          <div style={{ fontSize: 13, color: "#1A5D3A", fontWeight: 600 }}>{player?.id}</div>
        </div>
      </div>
      <div style={styles.profileRow}><span style={styles.profileLabel}>Email</span><span>{player?.email}</span></div>
      <div style={styles.profileRow}><span style={styles.profileLabel}>Phone</span><span>{player?.phone}</span></div>
      <div style={styles.profileRow}><span style={styles.profileLabel}>GHIN</span><span>{player?.ghin}</span></div>
      <div style={styles.profileRow}><span style={styles.profileLabel}>Status</span><span style={{ color: "#18794E", fontWeight: 600 }}>Active Member</span></div>
    </div>
    <button style={{ ...styles.primaryBtn, background: "#DC2626" }} onClick={onLogout}>
      <Icon name="logout" size={16} color="#fff" /> Sign Out
    </button>
  </div>
);

// --- NOTIFICATIONS ---
const NotificationsPage = ({ notifications, setNotifications, onNavigate }) => {
  const markRead = (id) => setNotifications(n => n.map(x => x.id === id ? { ...x, read: true } : x));
  const typeIcons = { leaderboard: "trophy", tournament: "calendar", score: "check", payout: "dollar" };
  return (
    <div style={styles.page}>
      <h1 style={styles.pageTitle}>Notifications</h1>
      {notifications.length === 0 ? (
        <div style={styles.emptyState}><Icon name="bell" size={40} color="#CCC" /><p style={{ color: "#999", marginTop: 12 }}>No notifications yet.</p></div>
      ) : notifications.map(n => (
        <div key={n.id} onClick={() => markRead(n.id)} style={{ ...styles.card, marginBottom: 8, borderLeft: n.read ? "3px solid transparent" : "3px solid #1A5D3A", background: n.read ? "#fff" : "#F0FDF4", cursor: "pointer" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: n.read ? "#F3F4F6" : "#E6F9ED", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icon name={typeIcons[n.type] || "bell"} size={16} color={n.read ? "#999" : "#1A5D3A"} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: n.read ? 400 : 600, color: "#222" }}>{n.title}</div>
              <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{n.message}</div>
              <div style={{ fontSize: 11, color: "#AAA", marginTop: 4 }}>{n.date}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// --- ADMIN DASHBOARD ---
const AdminDashboard = ({ tournaments, setTournaments, players, registrations, scores, setScores, onNavigate, showToast, toast }) => {
  const [tab, setTab] = useState("tournaments");
  const [editingT, setEditingT] = useState(null);
  const [payoutPreview, setPayoutPreview] = useState(null);

  const tabs = [
    { id: "tournaments", label: "Tournaments", icon: "calendar" },
    { id: "players", label: "Players", icon: "users" },
    { id: "scores", label: "Scores", icon: "clipboard" },
    { id: "payouts", label: "Payouts", icon: "dollar" },
  ];

  const cycleStatus = (tid) => {
    const order = ["upcoming", "active", "closed", "leaderboard_visible"];
    setTournaments(ts => ts.map(t => {
      if (t.id !== tid) return t;
      const idx = order.indexOf(t.status);
      const next = order[(idx + 1) % order.length];
      showToast(`Status changed to ${next.replace("_", " ")}`);
      return { ...t, status: next, regOpen: next === "upcoming" };
    }));
  };

  const toggleReg = (tid) => {
    setTournaments(ts => ts.map(t => t.id === tid ? { ...t, regOpen: !t.regOpen } : t));
  };

  const verifyScore = (playerId, tournamentId) => {
    setScores(s => s.map(sc => sc.playerId === playerId && sc.tournamentId === tournamentId ? { ...sc, verified: true } : sc));
    showToast("Score verified!");
  };

  const showPayoutPreview = (t) => {
    const tScores = scores.filter(s => s.tournamentId === t.id && s.verified).sort((a, b) => a.netScore - b.netScore || a.grossScore - b.grossScore);
    const pool = (registrations[t.id] || []).length * t.entryFee;
    const adminFee = Math.round(pool * 0.1);
    const payoutPool = pool - adminFee;
    const payouts = (t.payoutAmounts || [50, 30, 20]).slice(0, t.payoutPlaces || 3).map((pct, i) => ({
      player: tScores[i] ? players.find(p => p.id === tScores[i].playerId)?.name : "—",
      amount: Math.round(payoutPool * pct / 100),
      pct,
    }));
    setPayoutPreview({ tournament: t, pool, adminFee, payoutPool, payouts });
  };

  return (
    <div style={styles.page}>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={styles.pageTitle}>Admin Panel</h1>
        <button style={styles.outlineBtnSm} onClick={() => onNavigate("dashboard")}>← Player View</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, overflowX: "auto", paddingBottom: 4 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ ...styles.tabBtn, ...(tab === t.id ? styles.tabBtnActive : {}) }}>
            <Icon name={t.icon} size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tournaments Tab */}
      {tab === "tournaments" && (
        <div>
          {tournaments.map(t => (
            <div key={t.id} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={styles.cardTitle}>{t.name}</h3>
                  <p style={styles.cardMeta}>{t.course} · {t.dateRange} · ${t.entryFee}</p>
                  <p style={{ fontSize: 12, color: "#999" }}>Deadline: {t.submissionDeadline}</p>
                  <p style={{ fontSize: 12, color: "#999" }}>Registered: {(registrations[t.id] || []).length} players</p>
                </div>
                <StatusBadge status={t.status} />
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap" }}>
                <button style={styles.adminBtn} onClick={() => cycleStatus(t.id)}>Cycle Status</button>
                <button style={{ ...styles.adminBtn, background: t.regOpen ? "#FEE2E2" : "#E6F9ED" }} onClick={() => toggleReg(t.id)}>
                  Reg: {t.regOpen ? "Open" : "Closed"}
                </button>
                <button style={styles.adminBtn} onClick={() => showPayoutPreview(t)}>Payouts</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Players Tab */}
      {tab === "players" && (
        <div>
          {players.map(p => (
            <div key={p.id} style={{ ...styles.card, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{p.id} · GHIN: {p.ghin}</div>
                <div style={{ fontSize: 12, color: "#888" }}>{p.email} · {p.phone}</div>
              </div>
              <span style={{ fontSize: 12, color: "#18794E", fontWeight: 600 }}>Active</span>
            </div>
          ))}
        </div>
      )}

      {/* Scores Tab */}
      {tab === "scores" && (
        <div>
          {tournaments.map(t => {
            const tScores = scores.filter(s => s.tournamentId === t.id);
            if (tScores.length === 0) return null;
            return (
              <div key={t.id}>
                <h3 style={styles.sectionTitle}>{t.name}</h3>
                {tScores.map((s, i) => {
                  const p = players.find(pl => pl.id === s.playerId);
                  return (
                    <div key={i} style={{ ...styles.card, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{p?.name} ({p?.id})</div>
                        <div style={{ fontSize: 12, color: "#888" }}>Net: {s.netScore} · Gross: {s.grossScore} · Partner: {s.partner}</div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                        {s.verified ? (
                          <span style={{ fontSize: 11, color: "#18794E", fontWeight: 600 }}>✓ Verified</span>
                        ) : (
                          <button style={{ ...styles.adminBtn, background: "#E6F9ED" }} onClick={() => verifyScore(s.playerId, s.tournamentId)}>Verify</button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Payouts Tab */}
      {tab === "payouts" && (
        <div>
          <p style={styles.muted}>Select a tournament from the Tournaments tab and click "Payouts" to preview payout calculations.</p>
          {payoutPreview && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>{payoutPreview.tournament.name} — Payout Preview</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "16px 0" }}>
                <div style={styles.statBox}><span style={styles.statLabel}>Prize Pool</span><span style={styles.statVal}>${payoutPreview.pool}</span></div>
                <div style={styles.statBox}><span style={styles.statLabel}>Admin Fee (10%)</span><span style={styles.statVal}>${payoutPreview.adminFee}</span></div>
                <div style={styles.statBox}><span style={styles.statLabel}>Payout Pool</span><span style={styles.statVal}>${payoutPreview.payoutPool}</span></div>
              </div>
              <div style={{ borderRadius: 8, overflow: "hidden", border: "1px solid #eee" }}>
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 60px 70px", padding: "8px 12px", background: "#F9FAFB", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase" }}>
                  <span>#</span><span>Player</span><span>%</span><span style={{ textAlign: "right" }}>Amount</span>
                </div>
                {payoutPreview.payouts.map((p, i) => (
                  <div key={i} style={{ display: "grid", gridTemplateColumns: "40px 1fr 60px 70px", padding: "10px 12px", borderTop: "1px solid #f0f0f0" }}>
                    <span style={{ fontWeight: 700, color: "#1A5D3A" }}>{i + 1}</span>
                    <span style={{ fontSize: 14 }}>{p.player}</span>
                    <span style={{ fontSize: 13, color: "#888" }}>{p.pct}%</span>
                    <span style={{ textAlign: "right", fontWeight: 700, color: "#1A5D3A", fontFamily: "'Outfit', sans-serif" }}>${p.amount}</span>
                  </div>
                ))}
              </div>
              <button style={{ ...styles.primaryBtn, marginTop: 16 }} onClick={() => showToast("Payouts finalized and credited to player wallets!")}>Finalize Payouts</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- STYLES ---
const styles = {
  appWrap: { fontFamily: "'DM Sans', sans-serif", background: "#F7F8FA", minHeight: "100vh", maxWidth: 480, margin: "0 auto", position: "relative", paddingBottom: 80, color: "#222" },
  pageContent: { minHeight: "calc(100vh - 80px)" },
  page: { padding: "20px 16px" },

  // Landing
  landing: { minHeight: "100vh", position: "relative" },
  landingBg: { minHeight: "100vh", background: "linear-gradient(165deg, #0D2818 0%, #1A5D3A 40%, #2D8F5E 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px", position: "relative", overflow: "hidden" },
  landingOverlay: { position: "absolute", inset: 0, background: "radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.05) 0%, transparent 60%)" },
  landingContent: { position: "relative", zIndex: 1, textAlign: "center", maxWidth: 360 },
  logoMark: { fontSize: 48, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: -1, lineHeight: 1.1, textShadow: "0 2px 20px rgba(0,0,0,0.3)" },
  landingTitle: { fontSize: 18, fontWeight: 300, color: "rgba(255,255,255,0.9)", letterSpacing: 12, marginTop: 4, fontFamily: "'Outfit', sans-serif" },
  landingTag: { fontSize: 15, color: "rgba(255,255,255,0.7)", marginTop: 24, fontWeight: 300 },
  landingDesc: { fontSize: 14, color: "rgba(255,255,255,0.5)", marginTop: 8, lineHeight: 1.6 },

  // Auth
  authWrap: { minHeight: "100vh", background: "#F7F8FA", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 },
  authCard: { background: "#fff", borderRadius: 20, padding: "32px 24px", width: "100%", maxWidth: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.06)" },
  authLogo: { fontSize: 28, fontWeight: 800, color: "#1A5D3A", fontFamily: "'Outfit', sans-serif", textAlign: "center", letterSpacing: -0.5 },
  authTitle: { fontSize: 22, fontWeight: 700, textAlign: "center", marginTop: 8, marginBottom: 4 },
  authSub: { fontSize: 14, color: "#888", textAlign: "center", marginBottom: 24 },
  authLink: { fontSize: 13, textAlign: "center", color: "#888", marginTop: 16 },

  // Inputs
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6 },
  input: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#FAFAFA", transition: "border-color 0.2s" },
  select: { width: "100%", padding: "12px 14px", borderRadius: 10, border: "1px solid #E0E0E0", fontSize: 15, fontFamily: "'DM Sans', sans-serif", outline: "none", boxSizing: "border-box", background: "#FAFAFA", appearance: "none" },
  uploadBox: { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 16px", borderRadius: 12, border: "2px dashed #D0D0D0", cursor: "pointer", background: "#FAFAFA" },

  // Buttons
  primaryBtn: { width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#1A5D3A", color: "#fff", fontSize: 15, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8 },
  ghostBtn: { width: "100%", padding: "12px", borderRadius: 12, border: "none", background: "transparent", color: "rgba(255,255,255,0.7)", fontSize: 14, fontFamily: "'DM Sans', sans-serif", cursor: "pointer", marginTop: 8 },
  primaryBtnSm: { padding: "8px 16px", borderRadius: 8, border: "none", background: "#1A5D3A", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  outlineBtnSm: { padding: "8px 16px", borderRadius: 8, border: "1px solid #1A5D3A", background: "transparent", color: "#1A5D3A", fontSize: 13, fontWeight: 600, fontFamily: "'DM Sans', sans-serif", cursor: "pointer" },
  backBtn: { background: "none", border: "none", color: "#1A5D3A", fontSize: 14, fontWeight: 500, cursor: "pointer", padding: 0, marginBottom: 12, fontFamily: "'DM Sans', sans-serif" },
  link: { color: "#1A5D3A", fontWeight: 600, cursor: "pointer" },

  // Cards
  card: { background: "#fff", borderRadius: 14, padding: "16px", marginBottom: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", border: "1px solid #F0F0F0" },
  cardTitle: { fontSize: 16, fontWeight: 700, margin: 0, color: "#222" },
  cardMeta: { fontSize: 13, color: "#888", margin: "4px 0 0" },

  // Navigation
  bottomNav: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#fff", borderTop: "1px solid #eee", display: "flex", justifyContent: "space-around", padding: "8px 0 env(safe-area-inset-bottom, 8px)", zIndex: 100 },
  navBtn: { background: "none", border: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", padding: "4px 12px" },
  badge: { position: "absolute", top: -4, right: -6, width: 16, height: 16, borderRadius: "50%", background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },

  // Dashboard
  header: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  logoSmall: { fontSize: 20, fontWeight: 800, color: "#1A5D3A", fontFamily: "'Outfit', sans-serif", letterSpacing: -0.5, marginBottom: 4 },
  pageTitle: { fontSize: 22, fontWeight: 700, margin: "0 0 4px", color: "#111", fontFamily: "'Outfit', sans-serif" },
  muted: { fontSize: 13, color: "#888", margin: "4px 0 0" },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 1, marginTop: 20, marginBottom: 10 },
  alertBtn: { position: "relative", background: "none", border: "none", cursor: "pointer", padding: 8 },
  alertBadge: { position: "absolute", top: 2, right: 2, width: 16, height: 16, borderRadius: "50%", background: "#DC2626", color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" },

  walletCard: { background: "linear-gradient(135deg, #0D2818, #1A5D3A, #2D8F5E)", borderRadius: 16, padding: "20px", marginBottom: 16, cursor: "pointer" },

  gridTwo: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 },
  actionCard: { background: "#fff", borderRadius: 14, padding: "20px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 8, border: "1px solid #F0F0F0", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.03)" },
  actionLabel: { fontSize: 13, fontWeight: 600, color: "#333" },

  // Misc
  successCircle: { width: 64, height: 64, borderRadius: "50%", background: "#E6F9ED", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" },
  emptyState: { textAlign: "center", padding: "48px 20px" },
  profileRow: { display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F5F5F5", fontSize: 14 },
  profileLabel: { color: "#888", fontWeight: 500 },
  txRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: "1px solid #F5F5F5" },

  // Admin
  tabBtn: { display: "flex", alignItems: "center", gap: 4, padding: "8px 14px", borderRadius: 8, border: "1px solid #E0E0E0", background: "#fff", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#666", whiteSpace: "nowrap" },
  tabBtnActive: { background: "#1A5D3A", color: "#fff", borderColor: "#1A5D3A" },
  adminBtn: { padding: "6px 12px", borderRadius: 6, border: "1px solid #E0E0E0", background: "#F9FAFB", fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'DM Sans', sans-serif", color: "#555" },
  statBox: { background: "#F9FAFB", borderRadius: 8, padding: "10px 8px", textAlign: "center", border: "1px solid #eee" },
  statLabel: { display: "block", fontSize: 10, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: 0.5 },
  statVal: { display: "block", fontSize: 18, fontWeight: 700, fontFamily: "'Outfit', sans-serif", color: "#1A5D3A", marginTop: 2 },
};
