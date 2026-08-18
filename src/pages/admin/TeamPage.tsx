import React, { useState, useEffect } from 'react';
import { teamAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit2, Trash2, Shield, Eye, EyeOff } from 'lucide-react';

interface TeamMember {
  _id: string;
  name: string;
  role: string;
  qualification?: string;
  experience?: string;
  image: string;
  imagePublicId?: string;
  isActive: boolean;
  order: number;
}

export default function TeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [qualification, setQualification] = useState('');
  const [experience, setExperience] = useState('');
  const [order, setOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.adminGetTeamMembers();
      if (response.data && response.data.success) {
        setTeam(response.data.data);
      } else {
        setTeam(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      toast.error('Error loading team members');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setName(member.name);
    setRole(member.role);
    setQualification(member.qualification || '');
    setExperience(member.experience || '');
    setOrder(member.order || 0);
    setIsActive(member.isActive);
    setImagePreview(member.image);
    setImageFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setLoading(true);
        await teamAPI.deleteTeamMember(id);
        toast.success('Team member deleted successfully!');
        await fetchTeam();
      } catch (error) {
        console.error('Error deleting team member:', error);
        toast.error('Error deleting team member. Please try again.');
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !role.trim()) {
      toast.error('Name and Role are required fields');
      return;
    }

    if (!editingMember && !imageFile) {
      toast.error('Please select an image file for the new team member');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('role', role);
      formData.append('qualification', qualification);
      formData.append('experience', experience);
      formData.append('order', String(order));
      formData.append('isActive', String(isActive));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (editingMember) {
        await teamAPI.updateTeamMember(editingMember._id, formData);
        toast.success('Team member updated successfully!');
      } else {
        await teamAPI.createTeamMember(formData);
        toast.success('Team member created successfully!');
      }

      await fetchTeam();
      handleCloseModal();
    } catch (error: any) {
      console.error('Error saving team member:', error);
      toast.error(error.response?.data?.message || 'Error saving team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingMember(null);
    setName('');
    setRole('');
    setQualification('');
    setExperience('');
    setOrder(0);
    setIsActive(true);
    setImageFile(null);
    setImagePreview(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-[#3DB9A6]" size={24} />
            Team Management
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage the professional team members displayed on the About Us page
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-[#3DB9A6] hover:bg-[#2ca693] text-white px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm shadow-[#3DB9A6]/10"
        >
          <Plus size={16} />
          Add Member
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#3DB9A6]"></div>
          </div>
        ) : team.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#3DB9A6]/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="text-[#3DB9A6]" size={28} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No Team Members Added</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Get started by adding your first healthcare advisor, researcher, or director.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center gap-2 border border-gray-250 text-gray-700 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300"
            >
              <Plus size={16} />
              Add First Member
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-gray-650 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Role & Credentials</th>
                  <th className="py-4 px-6">Experience</th>
                  <th className="py-4 px-6 text-center">Order</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {team.map((member) => (
                  <tr key={member._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.image}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border border-gray-100 shadow-sm"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop';
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-gray-900">{member.name}</h4>
                          <span className="text-xs text-gray-500">{member.qualification || 'No credentials'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-gray-800">{member.role}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-500">{member.experience || 'Not specified'}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-md px-2.5 py-1 text-xs font-bold text-gray-650">
                        {member.order}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          member.isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {member.isActive ? (
                          <>
                            <Eye size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <EyeOff size={12} />
                            Hidden
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(member)}
                          className="p-2 text-gray-500 hover:text-[#3DB9A6] hover:bg-[#3DB9A6]/5 rounded-lg transition-all"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Create Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-150 max-w-lg w-full overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-slate-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-lg">
                {editingMember ? 'Edit Team Member' : 'Add Team Member'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Rajesh Sharma"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3DB9A6] focus:ring-1 focus:ring-[#3DB9A6] outline-none transition-colors"
                  />
                </div>

                {/* Role */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Role / Position *
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Medical Advisor"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3DB9A6] focus:ring-1 focus:ring-[#3DB9A6] outline-none transition-colors"
                  />
                </div>

                {/* Qualification */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={(e) => setQualification(e.target.value)}
                    placeholder="e.g. MBBS, MS"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3DB9A6] focus:ring-1 focus:ring-[#3DB9A6] outline-none transition-colors"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Experience
                  </label>
                  <input
                    type="text"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    placeholder="e.g. 10+ years in Research"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3DB9A6] focus:ring-1 focus:ring-[#3DB9A6] outline-none transition-colors"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Sorting Order
                  </label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm focus:border-[#3DB9A6] focus:ring-1 focus:ring-[#3DB9A6] outline-none transition-colors"
                  />
                </div>

                {/* Is Active */}
                <div className="flex items-center pt-6 pl-4">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-gray-250 text-[#3DB9A6] focus:ring-[#3DB9A6] h-4.5 w-4.5"
                    />
                    <span className="text-sm font-semibold text-gray-700">Show on About page</span>
                  </label>
                </div>
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Profile Picture *
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border border-gray-100 shadow-sm"
                    />
                  )}
                  <div className="flex-grow">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-lg file:border-0
                        file:text-sm file:font-semibold
                        file:bg-[#3DB9A6]/5 file:text-[#3DB9A6]
                        hover:file:bg-[#3DB9A6]/10 file:cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1">JPEG, PNG, or WEBP. Square ratio recommended.</p>
                  </div>
                </div>
              </div>

              {/* Modal Footer / Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={submitting}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-lg border border-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#3DB9A6] hover:bg-[#2ca693] text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 shadow-sm flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    'Save Member'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
