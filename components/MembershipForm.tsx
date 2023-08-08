import * as React from 'react'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'

import { ClubMember } from '@/lib/ClubMember'

// import VisuallyHidden from './VisuallyHidden'

type Props =
  | {
      onConfirm: SubmitHandler<ClubMember | undefined> // HACK should be just undefined
      onInvalid?: SubmitErrorHandler<ClubMember>
    } & (
      | {
          mode: 'edit'
          memberInfo: ClubMember
        }
      | {
          mode: 'add'
          memberInfo?: never
        }
    )
export default function MembershipForm({
  onConfirm,
  onInvalid,
  mode,
  memberInfo
}: Props) {
  const defaultValues = mode === 'edit' ? memberInfo : new ClubMember()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ClubMember>({ defaultValues })
  console.log(errors)

  return (
    <form
      onSubmit={handleSubmit(
        // HACK
        (formData: ClubMember) => {
          onConfirm(
            new ClubMember(
              formData.firstName,
              formData.lastName,
              formData.paymentStatus,
              formData.CAP,
              formData.fiscalCode,
              formData.privacyConsent,
              formData.imagesConsent,
              formData.creationDate,
              new Date(formData.birthDate),
              formData.email,
              formData.address,
              formData.birthPlace,
              formData.birthProvince,
              formData.cityProvince,
              formData.city,
              formData.membershipStatus,
              formData.phoneNr,
              formData.membershipType,
              formData.lastEdit
            )
          )
        },
        onInvalid
      )}
    >
      <h1>Personal information</h1>
      <p>Type your personal information here</p>
      <BasicInputField
        type='text'
        label='Nome'
        placeholder='Nome'
        {...register('firstName', { required: true, maxLength: 80 })}
      />
      <BasicInputField
        type='text'
        label='Cognome'
        placeholder='Cognome'
        {...register('lastName', { required: true, maxLength: 100 })}
      />
      <BasicInputField
        type='text'
        label='Codice Fiscale'
        placeholder='Codice Fiscale'
        {...register('fiscalCode', {
          required: true,
          pattern:
            /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1})$|([0-9]{11})$/i
        })}
      />
      <BasicInputField
        type='text'
        label='Email'
        placeholder='Email'
        {...register('email', { required: true, pattern: /^\S+@\S+$/i })}
      />

      <BasicInputField
        type='text'
        label='Indirizzo'
        placeholder='Indirizzo'
        {...register('address', { required: true })}
      />
      <BasicInputField
        type='text'
        label='Nato/a a'
        placeholder='Nato/a a'
        {...register('birthPlace', {})}
      />
      <BasicInputField
        type='text'
        label='Residente in'
        placeholder='Residente in'
        {...register('city', {})}
      />
      <BasicInputField
        label='Telefono'
        type='tel'
        placeholder='000-000-0000'
        {...register('phoneNr', {
          required: true,
          minLength: 6,
          maxLength: 15
        })}
      />
      {/* <SelectField label='Stato Pagamenti' {...register('paymentStatus')}>
        {['Pagato', 'Non pagato'].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField> */}
      <BasicInputField
        type='text'
        label='CAP'
        placeholder='CAP'
        {...register('CAP', { required: true, pattern: /^(V-|I-)?[0-9]{5}$/i })}
      />
      <BasicInputField
        type='text'
        label='Provincia di Nascita'
        placeholder='Provincia di Nascita'
        {...register('birthProvince', { required: true, maxLength: 2 })}
      />
      <BasicInputField
        type='text'
        label='Provincia di Residenza'
        placeholder='Provincia residenza'
        {...register('cityProvince', { required: true, maxLength: 2 })}
      />
      {/* <SelectField label='Stato Associativo' {...register('membershipStatus')}>
        {['Attivo', 'Dismesso', 'Congelato'].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField> */}
      <SelectField
        label='Tipologia Affiliazione'
        {...register('membershipType', { required: true })}
      >
        {[
          'Socio Adulto Ordinario Annuale',
          'Socio Under18',
          'Socio Sostenitore'
          // 'Socio Onorario',
        ].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField>
      <BasicInputField
        label='Data di Nascita'
        type='datetime-local'
        {...register('birthDate', { required: true })}
      />
      <BasicInputField
        type='checkbox'
        label='Consenso Privacy'
        placeholder='Consenso Privacy'
        {...register('privacyConsent', { required: true })}
      />
      <BasicInputField
        type='checkbox'
        label='Consenso Trattamento Immagini'
        placeholder='Consenso Trattamento Immagini'
        {...register('imagesConsent', {})}
      />
      <input type='submit' />
    </form>
  )
}

type FormField<T> = T & {
  label: string
  issues?: string[]
}

type BasicInputFieldProps = FormField<
  React.InputHTMLAttributes<HTMLInputElement>
>
const BasicInputField = React.forwardRef<
  HTMLInputElement,
  BasicInputFieldProps
>(({ label, issues, ...props }, ref) => {
  return (
    <div>
      {props.type === 'checkbox' && <input {...props} ref={ref} />}
      <label>{label}</label>
      {/* <VisuallyHidden>{label}</VisuallyHidden> */}
      {props.type !== 'checkbox' && <input {...props} ref={ref} />}
      <ul>
        {issues?.map((issue) => (
          <li key={`${props.name}_${issue}`}>{issue}</li>
        ))}
      </ul>
    </div>
  )
})
BasicInputField.displayName = 'BasicInputField'

type SelectFieldProps = FormField<React.SelectHTMLAttributes<HTMLSelectElement>>
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, issues, ...props }, ref) => {
  return (
    <div>
      <label>{label}</label>
      {/* <VisuallyHidden>{label}</VisuallyHidden> */}
      <select {...props} ref={ref} />
      <ul>
        {issues?.map((issue) => (
          <li key={`${props.name}_${issue}`}>{issue}</li>
        ))}
      </ul>
    </div>
  )
})
SelectField.displayName = 'SelectField'
