import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Get role information from localStorage
  const storedRole = AuthSession.getRoles();
  const storedRoleStr = String(storedRole || "");

  // Parse the stored role JSON if it exists
  let parsedRole = null;
  try {
    if (storedRoleStr && storedRoleStr.charAt(0) === "{") {
      parsedRole = JSON.parse(storedRoleStr);
    }
  } catch (e) {
    console.error("Failed to parse role data from localStorage", e);
  }

  // Get role name from parsed JSON or from profile or fallback
  const roleName =
    profile?.roles?.name ||
    parsedRole?.name ||
    (storedRoleStr === "1" ? "Admin" : storedRoleStr) ||
    "Yükleniyor...";

  const email = profile?.email ?? AuthSession.getEmail();

  return (
    <div className="profile-section">
      <div className="profile-avatar">
        <img
          src={
            profile?.profileImage ||
            "https://ui-avatars.com/api/?name=" +
              (profile?.name || "User") +
              "&background=2a86db&color=fff&size=128"
          }
          alt="Profile"
        />
      </div>
      <div className="profile-info">
        <h2>Merhaba, {profile?.name || "Kullanıcı"}</h2>
        <p className="profile-email">
          <i className="profile-icon email-icon">✉️</i> {email}
        </p>
        <p className="profile-role">
          <i className="profile-icon role-icon">👤</i> {roleName}
        </p>
      </div>
    </div>
  );
};

export default ProfileCard;
