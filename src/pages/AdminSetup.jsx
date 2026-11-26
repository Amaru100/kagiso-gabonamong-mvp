import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function AdminSetup() {
  const [token] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get("token"));
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  const [done,setDone] = useState(false);
  useEffect(() => {
    if (window.location.hash) window.history.replaceState(window.history.state,"",window.location.pathname);
  }, []);
  async function submit(event) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    if (values.get("password") !== values.get("confirmation")) {setError("The passwords must match.");return;}
    setBusy(true);setError("");
    try {
      const response = await fetch("/api/admin?view=setup",{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({tokenHash:token,newPassword:values.get("password")}),
      });
      if (!response.ok) {
        const result = await response.json().catch(()=>({}));
        throw new Error(result.error || "Password setup is unavailable.");
      }
      setDone(true);
    } catch (error) {setError(error.message);}
    finally {setBusy(false);}
  }
  return <main className="admin-login">
    <Link to="/admin/login">Back to sign in</Link>
    <h1 className="display-heading mt-5">Set your password</h1>
    {done ? <p role="status">Password saved. You can now <Link className="underline" to="/admin/login">sign in</Link>.</p> :
      !token ? <p>Open the private setup link from your site developer to set your password.</p> :
      <form onSubmit={submit} className="grid gap-4 mt-5">
        <label className="admin-label">New password<input className="admin-input" name="password" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></label>
        <label className="admin-label">Confirm password<input className="admin-input" name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={72} required /></label>
        <button className="admin-primary" disabled={busy}>{busy ? "Saving password..." : "Save password"}</button>
        {error && <p role="alert" className="admin-error">{error}</p>}
      </form>}
  </main>;
}
