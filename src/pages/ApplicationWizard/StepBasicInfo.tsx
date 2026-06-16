
import { useState, useEffect } from 'react';
import { Building2, User, Phone, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { useApplicationStore } from '@/store/applicationStore';
import FormInput from '@/components/Form/FormInput';
import FormSelect from '@/components/Form/FormSelect';
import { validateIdCard, validatePhone, validateOrgName, validatePracticeAddress } from '@/utils/validator';
import { ORG_CATEGORY_MAP } from '@/types';

export default function StepBasicInfo() {
  const { currentApplication, updateBasicInfo } = useApplicationStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [warnings, setWarnings] = useState<Record<string, string>>({});

  const basicInfo = currentApplication?.basicInfo;

  const handleChange = (field: string, value: string) => {
    updateBasicInfo({ [field]: value });
    
    let newErrors = { ...errors };
    let newWarnings = { ...warnings };

    if (field === 'orgName') {
      const result = validateOrgName(value);
      if (result?.type === 'error') {
        newErrors[field] = result.message;
        delete newWarnings[field];
      } else if (result?.type === 'warning') {
        newWarnings[field] = result.message;
        delete newErrors[field];
      } else {
        delete newErrors[field];
        delete newWarnings[field];
      }
    }

    if (field === 'practiceAddress') {
      const result = validatePracticeAddress(value);
      if (result?.type === 'error') {
        newErrors[field] = result.message;
        delete newWarnings[field];
      } else if (result?.type === 'warning') {
        newWarnings[field] = result.message;
        delete newErrors[field];
      } else {
        delete newErrors[field];
        delete newWarnings[field];
      }
    }

    if (field === 'legalIdCard' || field === 'directorIdCard') {
      if (value && !validateIdCard(value)) {
        newErrors[field] = '身份证号格式不正确';
      } else {
        delete newErrors[field];
      }
    }

    if (field === 'legalPhone' || field === 'directorPhone' || field === 'contactPhone') {
      if (value && !validatePhone(value)) {
        newErrors[field] = '手机号格式不正确';
      } else {
        delete newErrors[field];
      }
    }

    setErrors(newErrors);
    setWarnings(newWarnings);
  };

  if (!basicInfo) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">机构基本信息</h2>
          <p className="text-sm text-gray-500">请填写医疗机构的基本信息，带 * 为必填项</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="col-span-2">
          <div className="relative">
            <FormInput
              label="机构名称"
              required
              value={basicInfo.orgName}
              onChange={(e) => handleChange('orgName', e.target.value)}
              placeholder="请输入机构全称"
              error={errors.orgName}
            />
            {warnings.orgName && (
              <div className="flex items-center gap-1 mt-1 text-amber-600">
                <AlertCircle className="w-3.5 h-3.5" />
                <span className="text-xs">{warnings.orgName}</span>
              </div>
            )}
          </div>
        </div>

        <FormInput
          label="机构类别"
          value={ORG_CATEGORY_MAP[basicInfo.orgCategory as keyof typeof ORG_CATEGORY_MAP] || ''}
          disabled
          className="bg-gray-50"
        />

        <FormSelect
          label="经营性质"
          required
          value={basicInfo.businessNature}
          onChange={(e) => handleChange('businessNature', e.target.value)}
          options={[
            { value: '营利性', label: '营利性' },
            { value: '非营利性', label: '非营利性' },
          ]}
        />

        <FormInput
          label="注册资金"
          value={basicInfo.registeredCapital}
          onChange={(e) => handleChange('registeredCapital', e.target.value)}
          placeholder="请输入注册资金"
        />

        <FormInput
          label="业务范围"
          value={basicInfo.businessScope}
          onChange={(e) => handleChange('businessScope', e.target.value)}
          placeholder="请简要描述业务范围"
        />
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">法定代表人</h3>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <FormInput
            label="姓名"
            required
            value={basicInfo.legalRepresentative}
            onChange={(e) => handleChange('legalRepresentative', e.target.value)}
            placeholder="请输入法定代表人姓名"
          />
          <FormInput
            label="身份证号"
            required
            value={basicInfo.legalIdCard}
            onChange={(e) => handleChange('legalIdCard', e.target.value)}
            placeholder="请输入身份证号"
            error={errors.legalIdCard}
          />
          <FormInput
            label="联系电话"
            required
            value={basicInfo.legalPhone}
            onChange={(e) => handleChange('legalPhone', e.target.value)}
            placeholder="请输入手机号"
            error={errors.legalPhone}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">主要负责人</h3>
        </div>

        <div className="grid grid-cols-3 gap-5">
          <FormInput
            label="姓名"
            required
            value={basicInfo.mainDirector}
            onChange={(e) => handleChange('mainDirector', e.target.value)}
            placeholder="请输入主要负责人姓名"
          />
          <FormInput
            label="身份证号"
            required
            value={basicInfo.directorIdCard}
            onChange={(e) => handleChange('directorIdCard', e.target.value)}
            placeholder="请输入身份证号"
            error={errors.directorIdCard}
          />
          <FormInput
            label="联系电话"
            required
            value={basicInfo.directorPhone}
            onChange={(e) => handleChange('directorPhone', e.target.value)}
            placeholder="请输入手机号"
            error={errors.directorPhone}
          />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-base font-semibold text-gray-900">执业地址</h3>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div className="col-span-2">
            <div className="relative">
              <FormInput
                label="详细地址"
                required
                value={basicInfo.practiceAddress}
                onChange={(e) => handleChange('practiceAddress', e.target.value)}
                placeholder="请输入详细执业地址"
                error={errors.practiceAddress}
              />
              {warnings.practiceAddress && (
                <div className="flex items-center gap-1 mt-1 text-amber-600">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span className="text-xs">{warnings.practiceAddress}</span>
                </div>
              )}
            </div>
          </div>
          <FormInput
            label="机构电话"
            value={basicInfo.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="请输入机构联系电话"
            error={errors.contactPhone}
          />
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
        <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-900">填写提示</p>
          <p className="text-xs text-blue-700 mt-1">
            请确保所有信息真实有效，机构名称应符合《医疗机构管理条例》命名规范，
            包含识别名称+通用名称。法定代表人与主要负责人可为同一人。
          </p>
        </div>
      </div>
    </div>
  );
}
