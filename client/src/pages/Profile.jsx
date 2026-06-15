import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile, reset } from "../redux/userSlice";
import toast from "react-hot-toast";

const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
    </label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all duration-200 shadow-sm"
      placeholder={placeholder}
    />
  </div>
);

const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200/50 transition-all duration-300">
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 text-lg">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-base font-bold text-slate-800 mt-0.5">{value || "Not provided"}</p>
    </div>
  </div>
);

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    age: "", mobile: "", schoolName: "", std: "",
    district: "", taluka: "", village: "",
    teacherName: "", teacherContact: ""
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const { user, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.user
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/users/profile", {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setFormData({
            name: data.name || "",
            email: data.email || "",
            password: "",
            age: data.age || "",
            mobile: data.mobile || "",
            schoolName: data.schoolName || "",
            std: data.std || "",
            district: data.district || "",
            taluka: data.taluka || "",
            village: data.village || "",
            teacherName: data.teacherName || "",
            teacherContact: data.teacherContact || ""
          });
          if (data.profilePic) {
            setPreview(`/uploads${data.profilePic.replace('/uploads', '')}`);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch profile");
      }
    };
    
    if (user) fetchProfile();
  }, [user]);

  useEffect(() => {
    if (isError) toast.error(message);
    if (isSuccess && isEditing) {
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    }
    dispatch(reset());
  }, [isError, isSuccess, message, dispatch, isEditing]);

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key] !== "") data.append(key, formData[key]);
    });
    if (image) data.append("profilePic", image);
    dispatch(updateProfile(data));
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Dynamic Header Banner */}
      <div className="h-64 sm:h-80 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-fuchsia-400 opacity-20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
        <div className="bg-white/70 backdrop-blur-2xl rounded-3xl shadow-xl shadow-slate-100 border border-slate-100/80 overflow-hidden">
          
          {/* Profile Header (Avatar & Name) */}
          <div className="p-8 sm:p-12 flex flex-col sm:flex-row items-center sm:items-end justify-between border-b border-slate-100">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 w-full">
              <div className="relative group">
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-white shadow-xl bg-gradient-to-br from-indigo-100 to-rose-50 flex-shrink-0">
                  {preview ? (
                    <img src={preview} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo-300 text-5xl">👤</div>
                  )}
                </div>
                {isEditing && (
                  <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-200">
                    <span className="text-2xl mb-1">📷</span>
                    <span className="text-xs font-bold uppercase tracking-wider">Change</span>
                    <input type="file" className="hidden" accept="image/*" onChange={onImageChange} />
                  </label>
                )}
              </div>
              
              <div className="text-center sm:text-left flex-grow pb-2">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-800 tracking-tight">{formData.name || user?.name || "Student"}</h1>
                <p className="text-indigo-600 font-bold mt-1 text-lg">{formData.email || user?.email}</p>
              </div>

              <div className="mt-6 sm:mt-0 pb-2">
                {!isEditing ? (
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-slate-100 text-slate-650 font-bold rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={onSubmit}
                      disabled={isLoading}
                      className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-100 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-70"
                    >
                      {isLoading ? "Saving..." : "Save"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8 sm:p-12 bg-slate-50/30">
            {!isEditing ? (
              <div className="space-y-10">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mr-3 text-lg">👤</span>
                    Personal Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem label="Full Name" value={formData.name} icon="A" />
                    <InfoItem label="Age" value={formData.age} icon="📅" />
                    <InfoItem label="Mobile Number" value={formData.mobile} icon="📱" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mr-3 text-lg">🎓</span>
                    Academic Details
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem label="School Name" value={formData.schoolName} icon="🏫" />
                    <InfoItem label="Standard (Std.)" value={formData.std} icon="📚" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mr-3 text-lg">📍</span>
                    Address Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem label="District" value={formData.district} icon="🗺️" />
                    <InfoItem label="Taluka (Tq)" value={formData.taluka} icon="🏢" />
                    <InfoItem label="Village" value={formData.village} icon="🏡" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
                    <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mr-3 text-lg">👨‍🏫</span>
                    Teacher Information
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InfoItem label="Teacher Name" value={formData.teacherName} icon="👨‍💼" />
                    <InfoItem label="Teacher Contact" value={formData.teacherContact} icon="📞" />
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="space-y-10">
                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100/60 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Personal Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Full Name" name="name" value={formData.name} onChange={onChange} />
                    <InputField label="Age" name="age" type="number" value={formData.age} onChange={onChange} />
                    <InputField label="Mobile Number" name="mobile" value={formData.mobile} onChange={onChange} />
                    <InputField label="Email Address" name="email" type="email" value={formData.email} onChange={onChange} />
                    <InputField label="New Password (optional)" name="password" type="password" value={formData.password} onChange={onChange} placeholder="Leave blank to keep current" />
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100/60 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Academic Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="School Name" name="schoolName" value={formData.schoolName} onChange={onChange} />
                    <InputField label="Standard (Std.)" name="std" value={formData.std} onChange={onChange} />
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100/60 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Address Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="District" name="district" value={formData.district} onChange={onChange} />
                    <InputField label="Taluka (Tq)" name="taluka" value={formData.taluka} onChange={onChange} />
                    <InputField label="Village" name="village" value={formData.village} onChange={onChange} />
                  </div>
                </div>

                <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-100/60 shadow-sm">
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Teacher Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Teacher Name" name="teacherName" value={formData.teacherName} onChange={onChange} />
                    <InputField label="Teacher Contact No." name="teacherContact" value={formData.teacherContact} onChange={onChange} />
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
