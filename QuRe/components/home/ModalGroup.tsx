import React from 'react';
import EditModal from '@/components/EditModal';
import CreateQRModal from '@/components/CreateQRModal';
import PremiumUpgradeModal from '@/components/PremiumUpgradeModal';

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
  onSaveCreateQRModal: (newValue: string) => void;
  customQRData: string;
  
  // Premium Upgrade Modal props
  isPremiumModalVisible: boolean;
  onClosePremiumModal: () => void;
  onUpgradePremium: () => void;
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
  customQRData,
  
  // Premium Upgrade Modal props
  isPremiumModalVisible,
  onClosePremiumModal,
  onUpgradePremium,
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
        onSave={onSaveCreateQRModal}
        initialValue={customQRData}
      />
      
      <PremiumUpgradeModal
        isVisible={isPremiumModalVisible}
        onClose={onClosePremiumModal}
        onUpgrade={onUpgradePremium}
      />
    </>
  );
};

export default ModalGroup;