import React, { useState, useEffect } from 'react';
import {
  RentalTransaction,
  RentalTransactionFormData,
  RentalItemFormData,
  PaymentPlan as PaymentPlanType, // Renamed to avoid conflict
  Equipment as EquipmentType, // Renamed to avoid conflict
  Customer as CustomerType, // Renamed to avoid conflict
} from '../../types';
import { useCrud } from '../../context/CrudContext';
import { useRentalTransactions } from '../../context/RentalTransactionContext';
import { usePaymentPlans } from '../../context/PaymentPlanContext';
import { useEquipment } from '../../context/EquipmentContext';
import { createRentalDetail, updateRentalDetail } from '../../services/api/rentals';
import {
  Save,
  X,
  Loader2,
  CalendarCheck2,
  IndianRupee,
  ListChecks,
  Info,
} from 'lucide-react';
import RentalItemsSection from './RentalItemsSection';
import RentalCustomerSection from './RentalCustomerSection';
import RentalStatusDates from './RentalStatusDates';
import RentalShippingBilling from './RentalShippingBilling';
import { formatCurrency } from '../../utils/formatting'; // Import formatCurrency
import usePincodeLookup from '../../utils/usePincodeLookup';
import { useNavigate } from 'react-router-dom';

const EQUIPMENT_RENTAL_STATUSES = ['Confirmed/Booked', 'Active/Rented Out'];

const RENTAL_STATUSES_FORM = ["Draft", "Pending Confirmation", "Confirmed/Booked", "Active/Rented Out", "Returned/Completed", "Overdue", "Cancelled"];

interface RentalTransactionFormProps {
  rental?: RentalTransaction | null;
  onSave: () => void;
  onCancel: () => void;
}

const initialFormData: RentalTransactionFormData = {
  customer_id: '',
  shipping_address: '',
  shipping_area: '',
  shipping_city: '',
  shipping_state: '',
  shipping_pincode: '',
  billing_address: '',
  billing_area: '',
  billing_city: '',
  billing_state: '',
  billing_pincode: '',
  mobile_number: '',
  email: '',
  rental_date: new Date().toISOString().split('T')[0],
  expected_return_date: '',
  payment_term: '',
  status: 'Draft',
  notes: '',
  rental_items: [],
};

const RentalTransactionForm: React.FC<RentalTransactionFormProps> = ({
  rental,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = useState<RentalTransactionFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof RentalTransactionFormData | `rental_items.${number}.equipment_id` | `rental_items.${number}.unit_rental_rate`, string>>>({});
  const { createItem, updateItem, loading: crudLoading, error: crudError } = useCrud();

  const {
    customersForFilter: customers,
    loadingCustomers,
    fetchCustomersForSelection,
    refreshRentalTransactions,
  } = useRentalTransactions();
  const { paymentPlans, loading: loadingPaymentPlans, refreshPaymentPlans } = usePaymentPlans();
  const { equipmentList: availableEquipment, loading: loadingEquipment, refreshEquipmentData: refreshAvailableEquipment } = useEquipment();

  const navigate = useNavigate();

  const [numberOfDays, setNumberOfDays] = useState<number>(0);
  const [calculatedTotalAmount, setCalculatedTotalAmount] = useState<number>(0);

  const [originalShippingPincode, setOriginalShippingPincode] = useState('');
  const [originalBillingPincode, setOriginalBillingPincode] = useState('');

  // When creating a new rental, user can opt to update the customer's
  // stored address with the shipping address from this form.
  const [updateCustomerAddress, setUpdateCustomerAddress] = useState<boolean>(false);

  const shouldFetchShipping =
    formData.shipping_pincode !== originalShippingPincode;
  const {
    loading: shippingPincodeDetailsLoading,
    error: shippingPincodeError,
    areaOptions: shippingAreaOptions,
    city: shippingCity,
    state: shippingState,
    isAreaSelect: shippingIsAreaSelect,
  } = usePincodeLookup(formData.shipping_pincode, shouldFetchShipping);

  const shouldFetchBilling =
    formData.billing_pincode !== originalBillingPincode;
  const {
    loading: billingPincodeDetailsLoading,
    error: billingPincodeError,
    areaOptions: billingAreaOptions,
    city: billingCity,
    state: billingState,
    isAreaSelect: billingIsAreaSelect,
  } = usePincodeLookup(formData.billing_pincode, shouldFetchBilling);

  const isEditing = !!rental;



  useEffect(() => {
    if (customers.length === 0 && !loadingCustomers) fetchCustomersForSelection();
    if (paymentPlans.length === 0 && !loadingPaymentPlans) refreshPaymentPlans();
    if (availableEquipment.length === 0 && !loadingEquipment) refreshAvailableEquipment();
  }, [
    customers.length, loadingCustomers, fetchCustomersForSelection,
    paymentPlans.length, loadingPaymentPlans, refreshPaymentPlans,
    availableEquipment.length, loadingEquipment, refreshAvailableEquipment
  ]);

  useEffect(() => {
    if (rental) {
      setFormData({
        customer_id: rental.customer_id || '',
        shipping_address: rental.shipping_address || '',
        shipping_area: rental.shipping_area || '',
        shipping_city: rental.shipping_city || '',
        shipping_state: rental.shipping_state || '',
        shipping_pincode: rental.shipping_pincode || '',
        billing_address: rental.billing_address || '',
        billing_area: rental.billing_area || '',
        billing_city: rental.billing_city || '',
        billing_state: rental.billing_state || '',
        billing_pincode: rental.billing_pincode || '',
        mobile_number: rental.mobile_number || '',
        email: rental.email || '',
        rental_date: rental.rental_date ? new Date(rental.rental_date).toISOString().split('T')[0] : '',
        expected_return_date: rental.expected_return_date ? new Date(rental.expected_return_date).toISOString().split('T')[0] : '',
        payment_term: rental.payment_term || '',
        status: rental.status || 'Draft',
        notes: rental.notes || '',
        rental_items: rental.rental_items?.map(item => ({
          temp_id: String(item.rental_detail_id || crypto.randomUUID()),
          equipment_id: String(item.equipment_id),
          equipment_name: item.equipment_name || availableEquipment.find(eq => eq.equipment_id === item.equipment_id)?.equipment_name || 'Loading...',
          unit_rental_rate: String(item.unit_rental_rate),
          default_equipment_rate: availableEquipment.find(eq => eq.equipment_id === item.equipment_id)?.rental_rate,
        })) || [],
      });
      setOriginalShippingPincode(rental.shipping_pincode || '');
      setOriginalBillingPincode(rental.billing_pincode || '');
    } else {
      setFormData(initialFormData);
      setOriginalShippingPincode('');
      setOriginalBillingPincode('');
    }
  }, [rental, availableEquipment]);

  // When customer changes, populate default details if available
  useEffect(() => {
    if (!formData.customer_id) return;
    const selected = customers.find(c => String(c.customer_id) === formData.customer_id);
    if (selected) {
      setFormData(prev => ({
        ...prev,
        shipping_address: prev.shipping_address || selected.shipping_address || '',
        shipping_area: prev.shipping_area || selected.shipping_area || '',
        shipping_city: prev.shipping_city || selected.shipping_city || '',
        shipping_state: prev.shipping_state || selected.shipping_state || '',
        shipping_pincode: prev.shipping_pincode || selected.shipping_pincode || '',
        billing_address: prev.billing_address || selected.shipping_address || '',
        billing_area: prev.billing_area || selected.shipping_area || '',
        billing_city: prev.billing_city || selected.shipping_city || '',
        billing_state: prev.billing_state || selected.shipping_state || '',
        billing_pincode: prev.billing_pincode || selected.shipping_pincode || '',
        mobile_number: prev.mobile_number || selected.mobile_number_1 || '',
        email: prev.email || selected.email || '',
      }));
    }
  }, [formData.customer_id, customers]);

  const calculateRentalDays = (startDateStr: string, endDateStr: string): number => {
    if (!startDateStr || !endDateStr) return 0;
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()) || endDate < startDate) {
      return 0;
    }
    // Calculate the difference in time
    const timeDiff = endDate.getTime() - startDate.getTime();
    // Convert time difference from milliseconds to days, add 1 to include both start and end day
    const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) +1;
    return dayDiff > 0 ? dayDiff : 0;
  };

  useEffect(() => {
    const days = calculateRentalDays(formData.rental_date, formData.expected_return_date || '');
    setNumberOfDays(days);

    const dailyRateFromItems = formData.rental_items.reduce((sum, item) => {
      const rate = parseFloat(item.unit_rental_rate) || 0;
      return sum + rate;
    }, 0);

    setCalculatedTotalAmount(days * dailyRateFromItems);
  }, [formData.rental_date, formData.expected_return_date, formData.rental_items]);

  useEffect(() => {
    if (!shouldFetchShipping) return;
    setFormData(prev => {
      let area = prev.shipping_area;
      if (shippingAreaOptions.length === 1 && !shippingIsAreaSelect) {
        area = shippingAreaOptions[0].value;
      } else if (shippingAreaOptions.length === 0) {
        area = '';
      }
      if (
        prev.shipping_city === shippingCity &&
        prev.shipping_state === shippingState &&
        prev.shipping_area === area
      ) {
        return prev;
      }
      return {
        ...prev,
        shipping_city: shippingCity,
        shipping_state: shippingState,
        shipping_area: area,
      };
    });
  }, [shippingCity, shippingState, shippingAreaOptions, shippingIsAreaSelect, shouldFetchShipping]);

  useEffect(() => {
    if (!shouldFetchBilling) return;
    setFormData(prev => {
      let area = prev.billing_area;
      if (billingAreaOptions.length === 1 && !billingIsAreaSelect) {
        area = billingAreaOptions[0].value;
      } else if (billingAreaOptions.length === 0) {
        area = '';
      }
      if (
        prev.billing_city === billingCity &&
        prev.billing_state === billingState &&
        prev.billing_area === area
      ) {
        return prev;
      }
      return {
        ...prev,
        billing_city: billingCity,
        billing_state: billingState,
        billing_area: area,
      };
    });
  }, [billingCity, billingState, billingAreaOptions, billingIsAreaSelect, shouldFetchBilling]);


  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof RentalTransactionFormData | `rental_items.${number}.equipment_id` | `rental_items.${number}.unit_rental_rate`, string>> = {};
    if (!formData.customer_id) errors.customer_id = 'Customer is required.';
    if (!formData.rental_date) errors.rental_date = 'Rental date is required.';
    if (!formData.expected_return_date) {
      errors.expected_return_date = 'Expected return date is required.';
    } else if (formData.rental_date && new Date(formData.expected_return_date) < new Date(formData.rental_date)) {
      errors.expected_return_date = 'Return date cannot be before rental date.';
    }

    if (formData.shipping_pincode && !/^\d{6}$/.test(formData.shipping_pincode)) {
      errors.shipping_pincode = 'Pincode must be 6 digits.';
    }
    if (formData.billing_pincode && !/^\d{6}$/.test(formData.billing_pincode)) {
      errors.billing_pincode = 'Pincode must be 6 digits.';
    }
    if (formData.mobile_number && formData.mobile_number.trim() && !/^\d{10}$/.test(formData.mobile_number)) {
      errors.mobile_number = 'Mobile number must be 10 digits.';
    }
    if (formData.email && formData.email.trim() && !/^[\w.-]+@[\w.-]+\.\w+$/.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }

    if (!formData.status) errors.status = 'Status is required.';

    formData.rental_items.forEach((item, index) => {
      if (!item.equipment_id) errors[`rental_items.${index}.equipment_id`] = 'Equipment is required.';
      if (!item.unit_rental_rate || parseFloat(item.unit_rental_rate) < 0) errors[`rental_items.${index}.unit_rental_rate`] = 'Rate must be non-negative.';
    });

    if (formData.rental_items.length === 0) {
        errors.rental_items = 'At least one rental item is required.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name as keyof RentalTransactionFormData]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleItemChange = (index: number, field: keyof RentalItemFormData, value: string) => {
    const updatedItems = [...formData.rental_items];
    const currentItem = { ...updatedItems[index], [field]: value };

    if (field === 'equipment_id') {
      const selectedEquipment = availableEquipment.find(eq => String(eq.equipment_id) === value);
      currentItem.equipment_name = selectedEquipment?.equipment_name || 'Unknown Equipment';
      currentItem.default_equipment_rate = selectedEquipment?.rental_rate;
      if (!currentItem.unit_rental_rate || currentItem.unit_rental_rate === "0") {
        currentItem.unit_rental_rate = selectedEquipment?.rental_rate !== null && selectedEquipment?.rental_rate !== undefined ? String(selectedEquipment.rental_rate) : '0';
      }
    }
    updatedItems[index] = currentItem;
    setFormData(prev => ({ ...prev, rental_items: updatedItems }));

    const errorKey = `rental_items.${index}.${field}` as keyof typeof formErrors;
    if (formErrors[errorKey]) {
      setFormErrors(prev => ({ ...prev, [errorKey]: undefined }));
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      rental_items: [
        ...prev.rental_items,
        {
          temp_id: crypto.randomUUID(),
          equipment_id: '',
          equipment_name: '',
          unit_rental_rate: '0',
          default_equipment_rate: null,
        },
      ],
    }));
  };

  const removeItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rental_items: prev.rental_items.filter((_, i) => i !== index),
    }));
    const newFormErrors = { ...formErrors };
    delete newFormErrors[`rental_items.${index}.equipment_id`];
    delete newFormErrors[`rental_items.${index}.unit_rental_rate`];
    setFormErrors(newFormErrors);
  };

  // Copy helper functions
  const copyShippingToBilling = () => {
    setFormData(prev => ({
      ...prev,
      billing_address: prev.shipping_address,
      billing_area: prev.shipping_area,
      billing_city: prev.shipping_city,
      billing_state: prev.shipping_state,
      billing_pincode: prev.shipping_pincode,
    }));
  };

  const copyBillingToShipping = () => {
    setFormData(prev => ({
      ...prev,
      shipping_address: prev.billing_address,
      shipping_area: prev.billing_area,
      shipping_city: prev.billing_city,
      shipping_state: prev.billing_state,
      shipping_pincode: prev.billing_pincode,
    }));
  };


  const handleSubmit = async (recordPay = false) => {
    if (!validateForm()) {
      return;
    }

    const apiData: any = {
      ...formData,
      payment_term: formData.payment_term || null,
      total_amount: calculatedTotalAmount, // Add calculated total amount
      rental_items: formData.rental_items.map(item => ({
        equipment_id: parseInt(item.equipment_id, 10),
        ...(isEditing &&
          rental?.rental_items?.find(ri => String(ri.equipment_id) === item.equipment_id)?.rental_detail_id
            ? { rental_detail_id: rental.rental_items.find(ri => String(ri.equipment_id) === item.equipment_id)!.rental_detail_id }
            : {})
      })),
    };

    if (apiData.expected_return_date === '') apiData.expected_return_date = null;
    if (apiData.notes === '') apiData.notes = null;

    try {
      let newId: number | null = null;
      if (isEditing && rental && rental.rental_id) {
        await updateItem('rental_transactions', rental.rental_id, apiData);
        newId = rental.rental_id;
        await Promise.all(
          apiData.rental_items.map((item: any) =>
            item.rental_detail_id
              ? updateRentalDetail(item.rental_detail_id, {
                  rental_id: rental.rental_id,
                  equipment_id: item.equipment_id,
                })
              : createRentalDetail({
                  rental_id: rental.rental_id,
                  equipment_id: item.equipment_id,
                })
          )
        );
      } else {
        const res = await createItem('rental_transactions', apiData);
        newId = res?.data?.rental_id ?? res?.data?.insertId ?? null;
        if (newId) {
          await Promise.all(
            apiData.rental_items.map((item: any) =>
              createRentalDetail({
                rental_id: Number(newId),
                equipment_id: item.equipment_id,
              })
            )
          );
        }
      }

      if (EQUIPMENT_RENTAL_STATUSES.includes(apiData.status)) {
        await Promise.all(
          apiData.rental_items.map((item: any) =>
            updateItem('equipment', item.equipment_id, { status: 'Rented' })
          )
        );
        refreshAvailableEquipment();
      }

      // Update customer's active rental flag and optionally address
      const customerUpdates: Record<string, any> = {
        has_active_rentals: EQUIPMENT_RENTAL_STATUSES.includes(apiData.status) ? 1 : 0,
      };
      if (!isEditing && updateCustomerAddress) {
        customerUpdates.shipping_address = apiData.shipping_address || null;
        customerUpdates.shipping_area = apiData.shipping_area || null;
        customerUpdates.shipping_city = apiData.shipping_city || null;
        customerUpdates.shipping_state = apiData.shipping_state || null;
        customerUpdates.shipping_pincode = apiData.shipping_pincode || null;
      }
      await updateItem('customers', apiData.customer_id, customerUpdates);

      if (recordPay && newId) {
        refreshRentalTransactions();
        navigate('/payments/new', { state: { payment: { rental_id: newId } } });
      } else {
        onSave();
      }
    } catch (err) {
      console.error('Failed to save rental transaction:', err);
    }
  };

  const inputClass = "mt-1 block w-full px-3 py-2 bg-white border border-light-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-blue focus:border-brand-blue sm:text-sm disabled:bg-light-gray-100";
  const labelClass = "block text-sm font-medium text-dark-text";
  const iconClass = "h-5 w-5 text-gray-400";

  return (
    <div className="w-full">
      <div className="flex justify-between items-center p-4 border-b border-light-gray-200">
        <h2 className="text-xl font-semibold text-brand-blue flex items-center">
          <CalendarCheck2 className="h-6 w-6 mr-2 text-brand-blue" />
          {isEditing ? 'Edit Rental Transaction' : 'New Rental Transaction'}
        </h2>
        <button onClick={onCancel} className="p-2 rounded-full hover:bg-light-gray-100">
          <X className="h-5 w-5 text-dark-text" />
        </button>
      </div>
        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="p-4 sm:p-6 space-y-6 overflow-y-auto">
          {crudError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded" role="alert">
              <p className="font-bold">Error Saving Rental</p>
              <p>{crudError}</p>
            </div>
          )}

          <RentalCustomerSection
            customerId={formData.customer_id}
            customers={customers}
            loadingCustomers={loadingCustomers}
            handleChange={handleChange}
            error={formErrors.customer_id}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
          />

          <RentalStatusDates
            data={{
              rental_date: formData.rental_date,
              expected_return_date: formData.expected_return_date,
              status: formData.status,
            }}
            numberOfDays={numberOfDays}
            errors={{
              rental_date: formErrors.rental_date,
              expected_return_date: formErrors.expected_return_date,
              status: formErrors.status,
            }}
            handleChange={handleChange}
            inputClass={inputClass}
            labelClass={labelClass}
            iconClass={iconClass}
            statusOptions={RENTAL_STATUSES_FORM}
          />

          <RentalShippingBilling
            data={{
              shipping_address: formData.shipping_address,
              shipping_area: formData.shipping_area,
              shipping_city: formData.shipping_city,
              shipping_state: formData.shipping_state,
              shipping_pincode: formData.shipping_pincode,
              billing_address: formData.billing_address,
              billing_area: formData.billing_area,
              billing_city: formData.billing_city,
              billing_state: formData.billing_state,
              billing_pincode: formData.billing_pincode,
              mobile_number: formData.mobile_number,
              email: formData.email,
            }}
            errors={formErrors as Record<string, string>}
            handleChange={handleChange}
            shippingPincodeDetailsLoading={shippingPincodeDetailsLoading}
            shippingPincodeError={shippingPincodeError}
            shippingAreaOptions={shippingAreaOptions}
            shippingIsAreaSelect={shippingIsAreaSelect}
            billingPincodeDetailsLoading={billingPincodeDetailsLoading}
            billingPincodeError={billingPincodeError}
            billingAreaOptions={billingAreaOptions}
            billingIsAreaSelect={billingIsAreaSelect}
            copyShippingToBilling={copyShippingToBilling}
            copyBillingToShipping={copyBillingToShipping}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          {!isEditing && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="update_customer_address"
                checked={updateCustomerAddress}
                onChange={(e) => setUpdateCustomerAddress(e.target.checked)}
                className="h-4 w-4 text-brand-blue border-gray-300 rounded"
              />
              <label htmlFor="update_customer_address" className="ml-2 text-sm text-dark-text">
                Update customer with this shipping address
              </label>
            </div>
          )}

          <RentalItemsSection
            items={formData.rental_items}
            formErrors={formErrors as Record<string, string>}
            availableEquipment={availableEquipment}
            loadingEquipment={loadingEquipment}
            handleItemChange={handleItemChange}
            removeItem={removeItem}
            addItem={addItem}
            inputClass={inputClass}
            labelClass={labelClass}
          />

          <fieldset className="grid grid-cols-1 gap-y-6 gap-x-4 md:grid-cols-2">
            <legend className="text-lg font-medium text-dark-text col-span-full mb-2">Payment & Notes</legend>
            <div>
              <label htmlFor="payment_term" className={labelClass}>Payment Term</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {loadingPaymentPlans ? <Loader2 className={`${iconClass} animate-spin`} /> : <ListChecks className={iconClass} />}
                </div>
                <select name="payment_term" id="payment_term" value={formData.payment_term || ''} onChange={handleChange} className={`${inputClass} pl-10`} disabled={loadingPaymentPlans}>
                  <option value="">{loadingPaymentPlans ? "Loading..." : "Select Payment Term"}</option>
                  {paymentPlans.map((pt: PaymentPlanType) => <option key={pt.plan_id} value={pt.plan_name}>{pt.plan_name}</option>)}
                </select>
              </div>
            </div>

            <div className="md:col-span-2">
                <label className={labelClass}>Calculated Total Rental Amount</label>
                <p className="mt-1 px-3 py-2 bg-light-gray-100 border border-light-gray-300 rounded-md text-dark-text/80 sm:text-sm flex items-center font-semibold text-green-700">
                   <IndianRupee size={18} className="mr-2"/> {formatCurrency(calculatedTotalAmount)}
                </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="notes" className={labelClass}>Notes</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 top-2 pl-3 flex items-start pointer-events-none"><Info className={iconClass} /></div>
                <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={`${inputClass} pl-10`}></textarea>
              </div>
            </div>
          </fieldset>

          <div className="flex justify-end items-center pt-6 border-t border-light-gray-200 mt-auto">
            <button
              type="button"
              onClick={onCancel}
              disabled={crudLoading || loadingCustomers || loadingPaymentPlans || loadingEquipment}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue mr-3 disabled:opacity-50"
            >
              <X className="inline h-4 w-4 mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={crudLoading || loadingCustomers || loadingPaymentPlans || loadingEquipment}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-blue hover:bg-brand-blue/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue disabled:opacity-50 flex items-center"
            >
              {crudLoading ? (
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
              ) : (
                <Save className="inline h-4 w-4 mr-1" />
              )}
              {isEditing ? 'Save Changes' : 'Create Rental'}
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={crudLoading || loadingCustomers || loadingPaymentPlans || loadingEquipment}
                className="ml-3 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600 disabled:opacity-50"
              >
                {crudLoading ? (
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                ) : (
                  <Save className="inline h-4 w-4 mr-1" />
                )}
                Create & Record Payment
              </button>
            )}
          </div>
        </form>
    </div>
  );
};

export default RentalTransactionForm;
