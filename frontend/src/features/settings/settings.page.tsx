import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LimitFetchActions, settingsUpdateActions } from "./redux/settingsSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectUserSettings } from "./redux/settingsSlice";
import { Button } from "primereact/button";
import DropdownSettingComponent from "./components/dropdown.setting.component";

const SettingsPage = () => {
  const dispatch = useDispatch();
  const userSettings = useAppSelector(selectUserSettings);
  const { monthly_limit = 0, daily_limit = 0, limit_id = 0 } = userSettings || {};

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    daily_limit: 0,
    monthly_limit: 0,
  });

  useEffect(() => {
    dispatch(LimitFetchActions.request());
  }, []);

  useEffect(() => {
    if (userSettings) {
      setFormData({
        daily_limit: daily_limit,
        monthly_limit: monthly_limit,
      });
    }
  }, [userSettings, daily_limit, monthly_limit]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      daily_limit: daily_limit,
      monthly_limit: monthly_limit,
    });
  };

  const handleSave = () => {
    if (!limit_id) return;
    dispatch(settingsUpdateActions.request({
      id: limit_id,
      daily_limit: formData.daily_limit,
      monthly_limit: formData.monthly_limit,
    }));
    setIsEditing(false);
  };

  const handleChange = (field: string, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-xl mx-auto pt-10">

      <div>
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-linear-to-r from-indigo-500 to-purple-600 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <i className="pi pi-wallet text-white text-xl"></i>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Spending Limits</h2>
                  <p className="text-indigo-100 text-sm">Control your daily & monthly budget</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded bg-white/20 border-0 hover:bg-white/30"
                  onClick={handleEditClick}
                  tooltip="Edit Limits"
                />
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-6 space-y-6">
            {/* Daily Limit Card */}
            <div className="from-emerald-50 to-teal-50 rounded-xl p-5">
              <FloatLabel>
                <InputText
                  id="daily_limit"
                  value={formData.daily_limit.toString()}
                  onChange={(e) => handleChange('daily_limit', Number(e.target.value))}
                  className="w-full text-2xl font-bold"
                  keyfilter="num"
                  readOnly={!isEditing}
                />
                <label htmlFor="daily_limit">Amount (₹)</label>
              </FloatLabel>
            </div>

            {/* Monthly Limit Card */}
            <div className="from-blue-50 to-indigo-50 rounded-xl p-5">
              <FloatLabel>
                <InputText
                  id="monthly_limit"
                  value={formData.monthly_limit.toString()}
                  onChange={(e) => handleChange('monthly_limit', Number(e.target.value))}
                  className="w-full text-2xl font-bold"
                  keyfilter="num"
                  readOnly={!isEditing}
                />
                <label htmlFor="monthly_limit">Amount (₹)</label>
              </FloatLabel>
            </div>
          </div>


          {/* Action Buttons */}
          {isEditing && (
            <div className="px-6 pb-6">
              <div className="flex gap-3">
                <Button
                  label="Save Changes"
                  icon="pi pi-check"
                  className="flex-1 p-button-success py-3"
                  onClick={handleSave}
                />
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  className="p-button-secondary p-button-outlined py-3"
                  onClick={handleCancel}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Expense Categories</h3>
        <DropdownSettingComponent />
      </div>


    </div>




  );
};

export default SettingsPage;