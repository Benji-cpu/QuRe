import React from 'react';
import EditModal from '@/components/EditModal';
import CreateQRModal, { QRData } from '@/components/CreateQRModal';
import PremiumUpgradeModal from '@/components/premium/PremiumUpgradeModal';
import { QRType } from '@/context/QRCodeTypes';

interface ModalGroupProps {
  // Edit Modal props
  isEditModalVisible: boolean;
  onCloseEditModal: () => void;
  onGradientSelect: (gradientKey: string) => void;
  currentGradientKey: string;
  
  // Create QR Modal props
  isCreateQRModalVisible: boolean;
  onCloseCreateQRModal: () => void;
  onSaveCreateQRModal: (newValue: string, label: string, type: QRType, styleOptions?: any) => void;
  initialValue?: QRData;
  onResetToCreate: () => void;
  
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
  currentGradientKey,
  
  // Create QR Modal props
  isCreateQRModalVisible,
  onCloseCreateQRModal,
  onSaveCreateQRModal,
  initialValue,
  onResetToCreate,
  
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
        onResetToCreate={onResetToCreate}
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