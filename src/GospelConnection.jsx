import React, { useState, useEffect } from "react";
import { Heart, MessageCircle, Send, Lock } from "lucide-react";
import {
  collection, addDoc, onSnapshot, query, orderBy, doc, updateDoc,
  arrayUnion, arrayRemove, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

/* =====================================================================
   GOSPEL CONNECTION
   A members-only feed for Integrity Records subscribers to share
   testimonies, encouragement, and updates with each other.

   Props:
   - isSubscriber: boolean  -> gates posting/full access
   - currentUser: { id, name, avatarHue }  -> who's posting/liking
   ===================================================================== */

const NAVY = "#0B1F3A";
const GOLD = "#C6A15B";
const CREAM = "#FAF6EE";

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

function LockedGate() {
  return (
    <div
      style={{
        background: NAVY, borderRadius: 16, padding: "48px 28px",
        textAlign: "center", color: "white", maxWidth: 480, margin: "40px auto",
        border: `1px solid ${GOLD}55`,
      }}
    >
      <div
        style={{
          width: 56, height: 56, borderRadius: "50%", background: `${GOLD}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <Lock size={24} color={GOLD} />
      </div>
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 22, margin: "0 0 10px", color: GOLD }}>
        Gospel Connection is for subscribers
      </h3>
      <p style={{ color: "#C9D2E0", fontSize: 14.5, lineHeight: 1.6, margin: "0 0 22px" }}>
        This is a space for Integrity Records subscribers to share testimonies,
        encouragement, and what God's doing in their music and their lives.
        Subscribe to join the conversation.
      </p>
      <button
        style={{
          background: GOLD, color: NAVY, border: "none", borderRadius: 999,
          padding: "12px 28px", fontWeight: 700, fontSize: 14.5, cursor: "pointer",
        }}
        onClick={() => window.dispatchEvent(new CustomEvent("open-subscribe"))}
      >
        View subscription plans
      </button>
    </div>
  );
}

function Composer({ currentUser, onPosted }) {
  const [text, setText] = useState("");
  const [posting, setPosting] = useState(false);

  async function handlePost() {
    if (!text.trim()) return;
    setPosting(true);
    try {
      await addDoc(collection(db, "gospelPosts"), {
        text: text.trim(),
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
    const q = query(collection(db, "gospelPosts", post.id, "comments"), orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
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

export default function GospelConnection({ isSubscriber, currentUser }) {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    if (!isSubscriber) return;
    const q = query(collection(db, "gospelPosts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [isSubscriber]);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 16px 60px" }}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: NAVY, margin: "0 0 6px" }}>
          Gospel Connection
        </h2>
        <p style={{ color: "#8A6D2F", fontSize: 13.5, fontStyle: "italic", margin: 0 }}>
          "Let us consider how we may spur one another on toward love and good deeds." — Hebrews 10:24
        </p>
      </div>{isSubscriber && ( 
      <div
        style={{
          marginBottom: 28,
          borderRadius: 12,
          background: `${GOLD}15`,
          border: `1px solid ${GOLD}55`,
          padding: "28px 20px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 14, color: NAVY, fontWeight: 700, marginBottom: 4 }}>
          🎥 A Personal Welcome from Chris
        </div>
        <div style={{ fontSize: 13, color: "#8A6D2F" }}>
          Coming soon
        </div>
      </div> 
    )}
    {isSubscriber && (  
        
    <a
        href="https://calendly.com/integrityrecordsadmin/30min"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "block",
          textAlign: "center",
          background: GOLD,
          color: NAVY,
          fontWeight: 700,
          fontSize: 15,
          padding: "14px 20px",
          borderRadius: 999,
          textDecoration: "none",
          marginBottom: 28,
        }}
      >
        Book a Free 1-on-1 Session with Chris
      </a>
    )}{!isSubscriber ? (
      <LockedGate />
    ) : (
      <>
        <Composer currentUser={currentUser} onPosted={() => {}} />
        {posts.length === 0 ? (
          <p style={{ textAlign: "center", color: "#999", fontSize: 14, marginTop: 40 }}>
            No posts yet — be the first to share something.
          </p>
        ) : (
          posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
        )}
      </>
    )}
  </div>
  );
}
    
          
          
          

          
        
        
      
      
        
      
        
        
          
      
      
    
    
        


        
        
          

          
          
          
          
          
          
        

          
        
      >
        Book a Free 1-on-1 Session with Chris
      </a>
    )}

      {!isSubscriber ? (
        <LockedGate />
      ) : (
        <>
          <Composer currentUser={currentUser} onPosted={() => {}} />
          {posts.length === 0 ? (
            <p style={{ textAlign: "center", color: "#999", fontSize: 14, marginTop: 40 }}>
              No posts yet — be the first to share something.
            </p>
          ) : (
            posts.map((post) => <PostCard key={post.id} post={post} currentUser={currentUser} />)
          )}
        </>
      )}
    </div>
  );
}
