import React from 'react';
import EditModal from '@/components/EditModal';
import CreateQRModal, { QRData } from '@/components/CreateQRModal';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';
import { QRType } from '@/context/QRCodeTypes';

interface ModalGroupProps {
  // Edit Modal props
  isEditModalVisible: boolean;
  onCloseEditModal: () => void;
  onGradientSelect: (gradientKey: string) => void;
  onEditCustomQR: () => void;
  onManageQureQR: () => void;
  currentGradientKey: string;
  
  // Create QR Modal props
  isCreateQRModalVisible: boolean;
  onCloseCreateQRModal: () => void;
  onSaveCreateQRModal: (newValue: string, label: string, type: QRType, styleOptions?: any) => void;
  initialValue?: QRData;
  
  // Premium Upgrade Modal props
  isPremiumModalVisible: boolean;
  onClosePremiumModal: () => void;
  onUpgradePremium: () => void;
  premiumTrigger?: 'qr-add' | 'branding-removal' | 'session' | 'generation';
}

const ModalGroup: React.FC<ModalGroupProps> = ({
  // Edit Modal props
  isEditModalVisible,
  onCloseEditModal,
  onGradientSelect,
  onEditCustomQR,
  onManageQureQR,
  currentGradientKey,
  
  // Create QR Modal props
  isCreateQRModalVisible,
  onCloseCreateQRModal,
  onSaveCreateQRModal,
  initialValue,
  
  // Premium Upgrade Modal props
  isPremiumModalVisible,
  onClosePremiumModal,
  onUpgradePremium,
  premiumTrigger = 'session',
}) => {
  return (
    <>
      <EditModal
        isVisible={isEditModalVisible}
        onClose={onCloseEditModal}
        onGradientSelect={onGradientSelect}
        onEditCustomQR={onEditCustomQR}
        onManageQureQR={onManageQureQR}
        currentGradientKey={currentGradientKey}
      />
      
      <CreateQRModal
        isVisible={isCreateQRModalVisible}
        onClose={onCloseCreateQRModal}
        onSave={(qrData) => {
          onSaveCreateQRModal(
            qrData.value, 
            qrData.label || '', 
            qrData.type,
            qrData.styleOptions
          );
        }}
        initialValue={initialValue}
      />
      
      <PremiumUpgradeModal
        isVisible={isPremiumModalVisible}
        onClose={onClosePremiumModal}
        onUpgrade={onUpgradePremium}
        trigger={premiumTrigger}
      />
    </>
  );
};

export default ModalGroup;