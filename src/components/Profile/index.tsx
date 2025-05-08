import type { UserInstance } from "../../models/user";
import AuthSession from "../../utils/session";
import "../profileCalendar.scss";

type ProfileCardProps = {
  profile: UserInstance;
};

const ProfileCard = ({ profile }: ProfileCardProps) => {
  // Role bilgisini localStorage'dan al
  const role = AuthSession.getRoles();
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
          <i className="profile-icon role-icon">👤</i> {role || "Yükleniyor..."}
        </p>
        <div className="profile-stats">
          <div className="profile-stat">
            <span className="stat-value">{profile?.schedulesCount || 0}</span>
            <span className="stat-label">Çizelge</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">{profile?.assignmentsCount || 0}</span>
            <span className="stat-label">Görev</span>
          </div>
          <div className="profile-stat">
            <span className="stat-value">{profile?.shiftsCount || 0}</span>
            <span className="stat-label">Vardiya</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
