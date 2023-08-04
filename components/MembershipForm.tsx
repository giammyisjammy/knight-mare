import * as React from 'react'
// import VisuallyHidden from './VisuallyHidden'
import { useForm, SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import { ClubMember, IClubMemberDTO } from '@/lib/ClubMember'

interface FormFields {
  Nome: string
  Cognome: string
  'Codice Fiscale': string
  Email: string
  Indirizzo: string
  'Nato/a a': string
  'Residente in': string
  Telefono: string
  'Stato Pagamenti': string
  CAP: string
  'Provincia di Nascita': string
  'Provincia residenza': string
  'Stato Associativo': string
  'Tipologia affiliazione': string
  'Data di Nascita': Date
  'Consenso Privacy': boolean
  'Consenso Trattamento Immagini': boolean
  'Tipologia Affiliazione': string
}
type Props =
  | {
      onConfirm: SubmitHandler<undefined>
      onInvalid?: SubmitErrorHandler<IClubMemberDTO>
    } & (
      | {
          mode: 'edit'
          memberInfo: IClubMemberDTO
        }
      | {
          mode: 'add'
          memberInfo?: never
        }
    )
export default function MembershipForm({
  onConfirm,
  onInvalid
}: // mode,
// memberInfo
Props) {
  // const defaultValues = mode === 'edit' ? memberInfo : new ClubMember()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormFields>()
  console.log(errors)

  return (
    <form onSubmit={handleSubmit(onConfirm, onInvalid)}>
      {/* <form onSubmit={handleSubmit(console.log)}> */}
      <h1>Personal information</h1>
      <p>Type your personal information here</p>
      <BasicInputField
        type='text'
        label='Nome'
        placeholder='Nome'
        {...register('Nome', { required: true, maxLength: 80 })}
      />
      <BasicInputField
        type='text'
        label='Cognome'
        placeholder='Cognome'
        {...register('Cognome', { required: true, maxLength: 100 })}
      />
      <BasicInputField
        type='text'
        label='Codice Fiscale'
        placeholder='Codice Fiscale'
        {...register('Codice Fiscale', {
          required: true,
          pattern:
            /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1})$|([0-9]{11})$/i
        })}
      />
      <BasicInputField
        type='text'
        label='Email'
        placeholder='Email'
        {...register('Email', { required: true, pattern: /^\S+@\S+$/i })}
      />

      <BasicInputField
        type='text'
        label='Indirizzo'
        placeholder='Indirizzo'
        {...register('Indirizzo', { required: true })}
      />
      <BasicInputField
        type='text'
        label='Nato/a a'
        placeholder='Nato/a a'
        {...register('Nato/a a', {})}
      />
      <BasicInputField
        type='text'
        label='Residente in'
        placeholder='Residente in'
        {...register('Residente in', {})}
      />
      <BasicInputField
        label='Telefono'
        type='tel'
        placeholder='000-000-0000'
        {...register('Telefono', {
          required: true,
          minLength: 6,
          maxLength: 12
        })}
      />
      <SelectField label='Stato Pagamenti' {...register('Stato Pagamenti')}>
        {['Pagato', 'Non pagato'].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField>
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
        {...register('Provincia di Nascita', { required: true, maxLength: 2 })}
      />
      <BasicInputField
        type='text'
        label='Provincia di Residenza'
        placeholder='Provincia residenza'
        {...register('Provincia residenza', { required: true, maxLength: 2 })}
      />
      <SelectField label='Stato Associativo' {...register('Stato Associativo')}>
        {['Attivo', 'Dismesso', 'Congelato'].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField>
      <SelectField
        label='Tipologia Affiliazione'
        {...register('Tipologia Affiliazione', { required: true })}
      >
        {[
          'Socio Under18',
          'Socio Onorario',
          'Socio Sostenitore',
          'Socio Adulto Ordinario Annuale'
        ].map((value, key) => (
          <option key={key} value={value}>
            {value}
          </option>
        ))}
      </SelectField>
      <BasicInputField
        label='Data di Nascita'
        type='datetime-local'
        {...register('Data di Nascita', { required: true })}
      />
      <BasicInputField
        type='checkbox'
        label='Consenso Privacy'
        placeholder='Consenso Privacy'
        {...register('Consenso Privacy', { required: true })}
      />
      <BasicInputField
        type='checkbox'
        label='Consenso Trattamento Immagini'
        placeholder='Consenso Trattamento Immagini'
        {...register('Consenso Trattamento Immagini', {})}
      />
      <input type='submit' />
    </form>
  )
}

type FormField<T> = Exclude<T, 'type'> & {
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
