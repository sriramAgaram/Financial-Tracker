import { InputText } from "primereact/inputtext";
import { FloatLabel } from "primereact/floatlabel";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { LimitFetchActions, settingsUpdateActions } from "./redux/settingsSagas";
import { useAppSelector } from "../../hooks/useAppSelector";
import { selectUserSettings } from "./redux/settingsSlice";
import { Button } from "primereact/button";
import DropdownSettingComponent from "./components/dropdown.setting.component";
import { showToast } from "../../store/uiSlice";

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
    <div className="w-full max-w-xl mx-auto pt-4 md:pt-10 px-4 md:px-0 pb-20 md:pb-0">

      <div>
        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 md:p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <i className="pi pi-wallet text-white text-lg md:text-xl"></i>
                </div>
                <div>
                  <h2 className="text-lg md:text-xl font-semibold text-white">Spending Limits</h2>
                  <p className="text-indigo-100 text-xs md:text-sm">Control your daily & monthly budget</p>
                </div>
              </div>
              {!isEditing && (
                <Button
                  icon="pi pi-pencil"
                  className="p-button-rounded bg-white/20 border-0 hover:bg-white/30 w-8 h-8 md:w-10 md:h-10"
                  onClick={handleEditClick}
                  tooltip="Edit Limits"
                  tooltipOptions={{ position: 'left' }}
                />
              )}
            </div>
          </div>

          {/* Card Body */}
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            {/* Daily Limit Card */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 md:p-5 border border-emerald-100/50">
              <FloatLabel>
                <InputText
                  id="daily_limit"
                  value={formData.daily_limit.toString()}
                  onChange={(e) => handleChange('daily_limit', Number(e.target.value))}
                  className="w-full text-xl md:text-2xl font-bold bg-transparent border-emerald-200 focus:border-emerald-500 focus:shadow-emerald-100"
                  keyfilter="num"
                  readOnly={!isEditing}
                />
                <label htmlFor="daily_limit" className="text-emerald-700">Daily Amount (₹)</label>
              </FloatLabel>
            </div>

            {/* Monthly Limit Card */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 md:p-5 border border-blue-100/50">
              <FloatLabel>
                <InputText
                  id="monthly_limit"
                  value={formData.monthly_limit.toString()}
                  onChange={(e) => handleChange('monthly_limit', Number(e.target.value))}
                  className="w-full text-xl md:text-2xl font-bold bg-transparent border-blue-200 focus:border-blue-500 focus:shadow-blue-100"
                  keyfilter="num"
                  readOnly={!isEditing}
                />
                <label htmlFor="monthly_limit" className="text-blue-700">Monthly Amount (₹)</label>
              </FloatLabel>
            </div>
          </div>


          {/* Action Buttons */}
          {isEditing && (
            <div className="px-4 pb-4 md:px-6 md:pb-6">
              <div className="flex gap-3">
                <Button
                  label="Save"
                  icon="pi pi-check"
                  className="flex-1 p-button-success py-2 md:py-3"
                  onClick={handleSave}
                />
                <Button
                  label="Cancel"
                  icon="pi pi-times"
                  className="flex-1 p-button-secondary p-button-outlined py-2 md:py-3"
                  onClick={handleCancel}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 md:mt-8">
        <h3 className="text-lg md:text-xl font-bold text-slate-800 mb-3 md:mb-4 px-1">Expense Categories</h3>
        <DropdownSettingComponent />
      </div>


    </div>




  );
};

export default SettingsPage;