
import React, { useState, useEffect } from "react";
import {
  Heart, MessageCircle, Send, Lock, Menu, X, ChevronRight,
  Video, Users, HandHeart, Calendar, KeyRound, Check,
} from "lucide-react";
import {
  collection, addDoc, onSnapshot, query, where, doc, updateDoc, setDoc, getDoc,
  arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/* =========================================================================
   GOSPEL CONNECTION — multi-room version
   -------------------------------------------------------------------------
   Rooms: Community, Prayer & Testimony (with video placeholder), One-on-One
   Counseling (Calendly), Meeting Room (Zoom link, admin/owner only edits).

   Admin permissions: any signed-in guest can unlock admin/owner-level
   controls (editing the Meeting Room Zoom link + private/public toggle) by
   entering a one-time admin code. Change ADMIN_CODE below to whatever you
   want it to be — treat it like a shared password, not a secret key: since
   this runs in the browser, anyone who really digs through the site's code
   (or the Firestore rules) could find it. It's a good gate for trusted
   guests, not a defense against a determined attacker.

   Props (unchanged from the single-feed version, so this is a drop-in
   replacement for the existing GospelConnection.jsx):
   - isSubscriber: boolean
   - currentUser: { id, name, avatarHue }
   ========================================================================= */

const NAVY = "#0B1F3A";
const GOLD = "#C6A15B";
const CREAM = "#FAF6EE";

// Change this to whatever code you want to hand out to trusted guests.
const ADMIN_CODE = "GC-ADMIN-2026";

const ROOMS = [
  { id: "community", label: "Community Room", icon: Users },
  { id: "prayer", label: "Prayer & Testimony Room", icon: HandHeart },
  { id: "counseling", label: "One-on-One Counseling", icon: Calendar },
  { id: "meeting", label: "Meeting Room", icon: Video },
];

function timeAgo(ts) {
  if (!ts) return "just now";
  const seconds = Math.floor((Date.now() - ts.toDate().getTime()) / 1000);
  if (seconds < 60) return "just now";
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function Avatar({ name, hue = "#7A2E2E", size = 40 }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  return (
    <div
      style={{
        width: size, height: size, borderRadius: "50%",
        background: hue, color: "white", fontWeight: 700,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: size * 0.42, flexShrink: 0, fontFamily: "Georgia, serif",
      }}
    >
      {initial}
    </div>
  );
}

function LockedGate({ label }) {
  return (
    <div
      style={{
        background: NAVY, borderRadius: 16, padding: "40px 24px",
        textAlign: "center", color: "white", maxWidth: 480, margin: "24px auto",
        border: `1px solid ${GOLD}55`,
      }}
    >
      <div
        style={{
          width: 52, height: 52, borderRadius: "50%", background: `${GOLD}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 18px",
        }}
      >
        <Lock size={22} color={GOLD} />
      </div>
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 19, margin: "0 0 8px", color: GOLD }}>
        {label || "This room is for subscribers"}
      </h3>
      <p style={{ color: "#C9D2E0", fontSize: 13.5, lineHeight: 1.6, margin: "0 0 18px" }}>
        Subscribe to Integrity Records to unlock this room, or ask about an admin invite
        if you're joining as a guest host.
      </p>
      <button
        style={{
          background: GOLD, color: NAVY, border: "none", borderRadius: 999,
          padding: "10px 24px", fontWeight: 700, fontSize: 13.5, cursor: "pointer",
        }}
        onClick={() => window.dispatchEvent(new CustomEvent("open-subscribe"))}
      >
        View subscription plans
      </button>
    </div>
  );
}

/* Video placeholder used in the Prayer & Testimony room (and reused in
   Meeting Room) — swap this out for a real embed whenever you have one. */
function VideoPlaceholder({ title, subtitle }) {
  return (
    <div
      style={{
        marginBottom: 20, borderRadius: 12, background: `${GOLD}15`,
        border: `1px solid ${GOLD}55`, padding: "28px 20px", textAlign: "center",
      }}
    >
      <Video size={22} color={GOLD} style={{ marginBottom: 8 }} />
      <div style={{ fontSize: 14, color: NAVY, fontWeight: 700, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontSize: 13, color: "#8A6D2F" }}>{subtitle || "Coming soon"}</div>
    </div>
  );
}

function Composer({ currentUser, roomId, onPosted }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "gospelPosts"), {
        text: text.trim(),
        roomId,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorHue: currentUser.avatarHue || "#7A2E2E",
        likes: [],
        commentCount: 0,
        createdAt: serverTimestamp(),
      });
      setText("");
      onPosted?.();
    } catch (err) {
      console.error("Failed to post:", err);
      alert("Couldn't post right now. Please try again.");
    } finally {
      setPosting(false);
    }
  }

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid #E7E1D3" }}>
      <div style={{ display: "flex", gap: 12 }}>
        <Avatar name={currentUser.name} hue={currentUser.avatarHue} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share a testimony, an update, or a word of encouragement..."
          rows={2}
          style={{
            flex: 1, border: "none", outline: "none", resize: "none",
            fontSize: 14.5, fontFamily: "inherit", color: "#333", paddingTop: 8,
          }}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginTop: 12, marginLeft: 52 }}>
        <button
          onClick={handlePost}
          disabled={posting || !text.trim()}
          style={{
            background: NAVY, color: "white", border: "none", borderRadius: 999,
            padding: "8px 20px", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            opacity: posting || !text.trim() ? 0.5 : 1,
            display: "flex", alignItems: "center", gap: 6,
          }}
        >
          <Send size={14} /> {posting ? "Posting..." : "Post"}
        </button>
      </div>
    </div>
  );
}

function CommentThread({ post, currentUser }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "gospelPosts", post.id, "comments"), (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (a.createdAt?.toMillis?.() || 0) - (b.createdAt?.toMillis?.() || 0));
      setComments(rows);
    });
    return unsub;
  }, [post.id]);

  async function submitComment() {
    if (!text.trim()) return;
    await addDoc(collection(db, "gospelPosts", post.id, "comments"), {
      text: text.trim(),
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorHue: currentUser.avatarHue || "#7A2E2E",
      createdAt: serverTimestamp(),
    });
    await updateDoc(doc(db, "gospelPosts", post.id), { commentCount: comments.length + 1 });
    setText("");
  }

  return (
    <div style={{ borderTop: "1px solid #EEE7D8", marginTop: 12, paddingTop: 12 }}>
      {comments.map((c) => (
        <div key={c.id} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <Avatar name={c.authorName} hue={c.authorHue} size={30} />
          <div style={{ background: CREAM, borderRadius: 12, padding: "8px 12px", flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 12.5, color: NAVY }}>{c.authorName}</div>
            <div style={{ fontSize: 13.5, color: "#444" }}>{c.text}</div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <Avatar name={currentUser.name} hue={currentUser.avatarHue} size={28} />
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && submitComment()}
          placeholder="Write a comment..."
          style={{
            flex: 1, border: "1px solid #E7E1D3", borderRadius: 999,
            padding: "7px 14px", fontSize: 13, outline: "none",
          }}
        />
      </div>
    </div>
  );
}

function PostCard({ post, currentUser }) {
  const [showComments, setShowComments] = useState(false);
  const liked = post.likes?.includes(currentUser.id);

  async function toggleLike() {
    const postRef = doc(db, "gospelPosts", post.id);
    await updateDoc(postRef, {
      likes: liked ? arrayRemove(currentUser.id) : arrayUnion(currentUser.id),
    });
  }

  return (
    <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 16, border: "1px solid #E7E1D3" }}>
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
        <Avatar name={post.authorName} hue={post.authorHue} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: NAVY }}>{post.authorName}</div>
          <div style={{ fontSize: 12, color: "#999" }}>{timeAgo(post.createdAt)}</div>
        </div>
      </div>
      {post.text && <p style={{ fontSize: 14.5, color: "#333", lineHeight: 1.6, margin: "0 0 10px" }}>{post.text}</p>}
      <div style={{ display: "flex", gap: 20, paddingTop: 8, borderTop: "1px solid #F0EBDC" }}>
        <button
          onClick={toggleLike}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", color: liked ? "#B5464B" : "#888", fontSize: 13.5, fontWeight: 600,
          }}
        >
          <Heart size={17} fill={liked ? "#B5464B" : "none"} /> {post.likes?.length || 0}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          style={{
            display: "flex", alignItems: "center", gap: 6, background: "none", border: "none",
            cursor: "pointer", color: "#888", fontSize: 13.5, fontWeight: 600,
          }}
        >
          <MessageCircle size={17} /> {post.commentCount || 0}
        </button>
      </div>
      {showComments && <CommentThread post={post} currentUser={currentUser} />}
    </div>
  );
}

/* Generic room feed used by Community + Prayer & Testimony */
function RoomFeed({ roomId, roomLabel, currentUser, canPost, showVideo, videoTitle, videoSubtitle }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "gospelPosts"), where("roomId", "==", roomId));
    const unsub = onSnapshot(q, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setPosts(rows);
    });
    return unsub;
  }, [roomId]);

  return (
    <div>
      {showVideo && <VideoPlaceholder title={videoTitle} subtitle={videoSubtitle} />}
      {canPost && <Composer currentUser={currentUser} roomId={roomId} onPosted={() => {}} />}
      {posts.length === 0 ? (
        <p style={{ textAlign: "center", color: "#999", fontSize: 14, marginTop: 24 }}>
          No posts yet in {roomLabel} — be the first to share something.
        </p>
      ) : (
        posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
      )}
    </div>
  );
}

function CounselingRoom({ allowed }) {
  if (!allowed) return <LockedGate label="One-on-One Counseling is for subscribers" />;
  return (
    <div style={{ textAlign: "center", padding: "20px 4px" }}>
      <p style={{ color: "#555", fontSize: 14.5, lineHeight: 1.6, marginBottom: 20 }}>
        Book a free 30-minute one-on-one session — a space to talk, pray, or just be heard.
      </p>
      <a
        href="https://calendly.com/integrityrecordsadmin/30min"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block", background: GOLD, color: NAVY, fontWeight: 700,
          fontSize: 15, padding: "14px 28px", borderRadius: 999, textDecoration: "none",
        }}
      >
        Book a Free Session
      </a>
    </div>
  );
}

/* Meeting Room — Zoom link + video placeholder. Editable only by
   owner/admin; everyone else just sees the join button (or a "private"
   notice if the host has it toggled off). */
function MeetingRoom({ allowed, isAdmin }) {
  const [state, setState] = useState({ zoomLink: "", isPrivate: false });
  const [loaded, setLoaded] = useState(false);
  const [draftLink, setDraftLink] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const ref = doc(db, "gospelMeeting", "main");
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : { zoomLink: "", isPrivate: false };
      setState({ zoomLink: data.zoomLink || "", isPrivate: !!data.isPrivate });
      setDraftLink(data.zoomLink || "");
      setLoaded(true);
    });
    return unsub;
  }, []);

  async function save(next) {
    await setDoc(doc(db, "gospelMeeting", "main"), next, { merge: true });
    setSaved(true);
    setTimeout(() => setSaved(false), 1200);
  }

  if (!allowed) return <LockedGate label="The Meeting Room is for subscribers" />;
  if (!loaded) return null;

  return (
    <div>
      <VideoPlaceholder
        title="Live meeting"
        subtitle={state.zoomLink ? "Tap below to join when it's time" : "No meeting link set yet"}
      />

      {isAdmin && (
        <div style={{ background: "white", borderRadius: 14, padding: 16, marginBottom: 20, border: "1px solid #E7E1D3" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: NAVY, marginBottom: 10 }}>
            Host controls
          </div>
          <input
            value={draftLink}
            onChange={(e) => setDraftLink(e.target.value)}
            placeholder="Paste the Zoom link here"
            style={{
              width: "100%", border: "1px solid #E7E1D3", borderRadius: 8,
              padding: "10px 12px", fontSize: 13.5, outline: "none", marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => save({ zoomLink: draftLink, isPrivate: !state.isPrivate })}
              style={{
                display: "flex", alignItems: "center", gap: 6, background: "none",
                border: `1px solid ${GOLD}`, color: NAVY, borderRadius: 999,
                padding: "6px 14px", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
              }}
            >
              <Lock size={13} /> {state.isPrivate ? "Private — tap to make public" : "Public — tap to make private"}
            </button>
            <button
              onClick={() => save({ zoomLink: draftLink, isPrivate: state.isPrivate })}
              style={{
                background: NAVY, color: "white", border: "none", borderRadius: 999,
                padding: "7px 16px", fontSize: 12.5, fontWeight: 700, cursor: "pointer",
              }}
            >
              {saved ? <Check size={14} /> : "Save"}
            </button>
          </div>
        </div>
      )}

      {!isAdmin && state.isPrivate && (
        <p style={{ textAlign: "center", color: "#999", fontSize: 14 }}>
          <Lock size={14} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          This meeting is currently private.
        </p>
      )}

      {!isAdmin && !state.isPrivate && (
        state.zoomLink ? (
          <a
            href={state.zoomLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block", textAlign: "center", background: GOLD, color: NAVY,
              fontWeight: 700, fontSize: 15, padding: "14px 20px", borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Join the Meeting
          </a>
        ) : (
          <p style={{ textAlign: "center", color: "#999", fontSize: 14 }}>No meeting link has been posted yet.</p>
        )
      )}
    </div>
  );
}

/* Small modal for redeeming an admin code */
function AdminCodeModal({ currentUser, onClose, onGranted }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function redeem() {
    setError("");
    if (code.trim() !== ADMIN_CODE) {
      setError("That code isn't valid.");
      return;
    }
    setBusy(true);
    try {
      await setDoc(
        doc(db, "users", currentUser.id),
        { isAdmin: true, adminCode: ADMIN_CODE },
        { merge: true }
      );
      onGranted();
      onClose();
    } catch (err) {
      setError("Couldn't save that right now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(10,11,16,0.7)" }}>
      <div style={{ width: "100%", maxWidth: 380, borderRadius: 12, padding: 22, background: "white" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <KeyRound size={17} color={GOLD} />
            <span style={{ fontFamily: "Georgia, serif", fontSize: 17, color: NAVY, fontWeight: 700 }}>Admin code</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <X size={18} color="#999" />
          </button>
        </div>
        <p style={{ fontSize: 13, color: "#666", marginBottom: 12 }}>
          Enter the code you were given to unlock host controls for this room.
        </p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter code"
          style={{
            width: "100%", border: "1px solid #E7E1D3", borderRadius: 8,
            padding: "10px 12px", fontSize: 14, outline: "none", marginBottom: 10,
            boxSizing: "border-box",
          }}
        />
        {error && <p style={{ color: "#B5464B", fontSize: 12.5, marginBottom: 10 }}>{error}</p>}
        <button
          onClick={redeem}
          disabled={busy || !code.trim()}
          style={{
            width: "100%", background: NAVY, color: "white", border: "none", borderRadius: 999,
            padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: "pointer",
            opacity: busy || !code.trim() ? 0.5 : 1,
          }}
        >
          {busy ? "Checking..." : "Unlock"}
        </button>
      </div>
    </div>
  );
}

export default function GospelConnection({ isSubscriber, currentUser }) {
  const [activeRoom, setActiveRoom] = useState("community");
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);

  useEffect(() => {
    if (!currentUser?.id || currentUser.id === "guest") return;
    const unsub = onSnapshot(doc(db, "users", currentUser.id), (snap) => {
      setIsAdmin(!!snap.data()?.isAdmin);
    });
    return unsub;
  }, [currentUser?.id]);

  const allowedForGatedRooms = isSubscriber || isAdmin;
  const activeRoomMeta = ROOMS.find((r) => r.id === activeRoom);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      {/* Top bar with breadcrumb / menu icon */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", borderBottom: "1px solid #E7E1D3", background: "white" }}>
        <button onClick={() => setMenuOpen(true)} aria-label="Open rooms menu" style={{ background: "none", border: "none", cursor: "pointer", padding: 6, display: "flex" }}>
          <Menu size={22} color={NAVY} />
        </button>
        <span style={{ fontSize: 13.5, color: "#999" }}>Gospel Connection</span>
        <ChevronRight size={14} color="#CCC" />
        <span style={{ fontSize: 13.5, color: NAVY, fontWeight: 700 }}>{activeRoomMeta?.label}</span>
        <button
          onClick={() => setAdminModalOpen(true)}
          style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", opacity: 0.5, display: "flex" }}
          aria-label="Enter admin code"
        >
          <KeyRound size={16} color={isAdmin ? GOLD : "#AAA"} />
        </button>
      </div>

      <div style={{ padding: "20px 16px 60px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <p style={{ color: "#8A6D2F", fontSize: 13.5, fontStyle: "italic", margin: 0 }}>
            "Let us consider how we may spur one another on toward love and good deeds." — Hebrews 10:24
          </p>
        </div>

        {activeRoom === "community" && (
          <RoomFeed roomId="community" roomLabel="Community Room" currentUser={currentUser} canPost />
        )}
        {activeRoom === "prayer" && (
          <RoomFeed
            roomId="prayer"
            roomLabel="Prayer & Testimony Room"
            currentUser={currentUser}
            canPost
            showVideo
            videoTitle="Prayer service"
            videoSubtitle="Coming soon"
          />
        )}
        {activeRoom === "counseling" && <CounselingRoom allowed={allowedForGatedRooms} />}
        {activeRoom === "meeting" && <MeetingRoom allowed={allowedForGatedRooms} isAdmin={isAdmin} />}
      </div>

      {/* Slide-in drawer */}
      {menuOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50 }}>
          <div onClick={() => setMenuOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(7,21,39,0.5)" }} />
          <div
            style={{
              position: "absolute", top: 0, left: 0, bottom: 0, width: 280, background: NAVY,
              boxShadow: "4px 0 24px rgba(0,0,0,0.3)", padding: "20px 16px", display: "flex", flexDirection: "column",
              animation: "slideIn 0.25s ease",
            }}
          >
            <style>{`@keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }`}</style>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <span style={{ color: GOLD, fontFamily: "Georgia, serif", fontSize: 18, fontWeight: 700 }}>Rooms</span>
              <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color="white" />
              </button>
            </div>
            {ROOMS.map((room) => {
              const Icon = room.icon;
              const active = room.id === activeRoom;
              const gated = (room.id === "counseling" || room.id === "meeting") && !allowedForGatedRooms;
              return (
                <button
                  key={room.id}
                  onClick={() => { setActiveRoom(room.id); setMenuOpen(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: active ? `${GOLD}22` : "none",
                    border: "none", borderRadius: 10, padding: "12px 10px", marginBottom: 4, cursor: "pointer",
                    color: active ? GOLD : "#C9D2E0", fontSize: 14.5, fontWeight: active ? 700 : 500, textAlign: "left",
                  }}
                >
                  <Icon size={17} />
                  {room.label}
                  {gated && <Lock size={12} style={{ marginLeft: "auto", opacity: 0.6 }} />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {adminModalOpen && (
        <AdminCodeModal
          currentUser={currentUser}
          onClose={() => setAdminModalOpen(false)}
          onGranted={() => setIsAdmin(true)}
        />
      )}
    </div>
  );
}
