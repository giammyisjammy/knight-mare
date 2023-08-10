import * as React from 'react'
import { useForm,
  SubmitHandler,
  SubmitErrorHandler,
  FormProvider,
  UseFormReturn,
  useFormContext,
  PathString
} from 'react-hook-form'
import cs from 'classnames'
import { ErrorMessage } from "@hookform/error-message";

import { ClubMember } from '@/lib/ClubMember'

import styles from './MembershipForm.module.css'

// import VisuallyHidden from './VisuallyHidden'

const validators = {
  required: (message = 'This is required.') => ({
    required: message
  }),
  minLength: (value: number, message = `This should be at least ${value} length.` ) => ({
    minLength:{ value, message }
  }),
  maxLength: (value: number, message = `This should be at most ${value} length.`) => ({
    maxLength:{ value, message }
  }),
  email: (message = 'Not a valid email.') => ({
    pattern: { value: /^\S+@\S+$/i, message }
  }),
  fiscalCode: (message = 'Not a valid fiscal code.') => ({
    pattern: {
      value: /^([A-Z]{6}[0-9LMNPQRSTUV]{2}[ABCDEHLMPRST]{1}[0-9LMNPQRSTUV]{2}[A-Z]{1}[0-9LMNPQRSTUV]{3}[A-Z]{1})$|([0-9]{11})$/i,
      message
    }
  }),
  CAP: (message = 'Not a valid CAP code.') => ({
    pattern: { value: /^(V-|I-)?[0-9]{5}$/i, message }
  })
}

const MembershipFormProvider: React.FC<{
  defaultValues?: ClubMember
  children: (methods: UseFormReturn<ClubMember, any, undefined>) => React.ReactNode;
}> = ({defaultValues, children}) => {
  const methods = useForm<ClubMember>({ defaultValues })

  console.log(methods.formState.errors)

  return <FormProvider {...methods}>
    {children(methods)}
  </FormProvider>
}

type Props =
  | {
    className?: string
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
  className,
  onConfirm,
  onInvalid,
  mode,
  memberInfo
}: Props) {
  const defaultValues = mode === 'edit' ? memberInfo : new ClubMember()

  return (
    <MembershipFormProvider defaultValues={defaultValues}>
      {({ register, handleSubmit })=>
        <form
          className={className}
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
          <div className={styles.container}>
            <InputField
              label='Nome'
              placeholder='Nome'
              {...register('firstName', { ...validators.required(), ...validators.maxLength(80) })}
            />
            <InputField
              label='Cognome'
              placeholder='Cognome'
              {...register('lastName', { ...validators.required(), ...validators.maxLength(100) })}
            />
            <InputField
              label='Codice Fiscale'
              placeholder='Codice Fiscale'
              {...register('fiscalCode', { ...validators.required(), ...validators.fiscalCode() })}
            />
            <InputField
              label='Email'
              placeholder='Email'
              {...register('email', { ...validators.required(), ...validators.email() })}
            />
            <InputField
              label='Indirizzo'
              placeholder='Indirizzo'
              {...register('address', { ...validators.required() })}
            />
            <InputField
              label='Nato/a a'
              placeholder='Nato/a a'
              {...register('birthPlace', { ...validators.required() })}
            />
            <InputField
              label='Residente in'
              placeholder='Residente in'
              {...register('city', { ...validators.required() })}
            />
            <InputField
              type='tel'
              label='Telefono'
              placeholder='000-000-0000'
              {...register('phoneNr', {
                ...validators.required(),
                ...validators.minLength(6),
                ...validators.maxLength(15)
              })}
            />
            <InputField
              label='CAP'
              placeholder='CAP'
              {...register('CAP', { ...validators.required(), ...validators.CAP() })}
            />
            <InputField
              label='Provincia di Nascita'
              placeholder='Provincia di Nascita'
              {...register('birthProvince', { ...validators.required(), ...validators.maxLength(2) })}
            />
            <InputField
              label='Provincia di Residenza'
              placeholder='Provincia residenza'
              {...register('cityProvince', { ...validators.required(), ...validators.maxLength(2) })}
            />
            <SelectField
              label='Tipologia Affiliazione'
              {...register('membershipType', { ...validators.required() })}
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
            <InputField
              type='datetime-local'
              label='Data di Nascita'
              {...register('birthDate', { ...validators.required() })}
            />
            <InputField
              type='checkbox'
              label='Consenso Privacy'
              placeholder='Consenso Privacy'
              {...register('privacyConsent', { ...validators.required() })}
            />
            <InputField
              type='checkbox'
              label='Consenso Trattamento Immagini'
              placeholder='Consenso Trattamento Immagini'
              {...register('imagesConsent', { ...validators.required() })}
            />
            <div className={styles.actions}>
              <input type='submit' />
            </div>
          </div>
        </form>
      }
    </MembershipFormProvider>
  )
}

type FormField<T> = T & {
  label: PathString
}

type InputFieldProps = FormField<
  React.InputHTMLAttributes<HTMLInputElement>
>
const InputField = React.forwardRef<
  HTMLInputElement,
  InputFieldProps
>(({ label, ...props }, ref) => {
  const { formState: { errors } } = useFormContext()

  return (
    <div className={cs(styles.field, { [styles.checkboxField]: props.type === 'checkbox' })}>
      <label className={cs({[styles.errorLabel] : !!errors[props.name] })}>{label}</label>
      {/* <VisuallyHidden>{label}</VisuallyHidden> */}
      <input {...props} ref={ref} />
      <ErrorMessage as="span" className={styles.errorMessage} name={props.name} errors={errors}/>
    </div>
  )
})
InputField.displayName = 'InputField'

type SelectFieldProps = FormField<React.SelectHTMLAttributes<HTMLSelectElement>>
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, ...props }, ref) => {
  const { formState: { errors } } = useFormContext()

  return (
    <div className={styles.field}>
      <label className={cs({[styles.errorLabel] : !!errors[props.name] })}>{label}</label>
      {/* <VisuallyHidden>{label}</VisuallyHidden> */}
      <select {...props} ref={ref} />
      <ErrorMessage as="span" className={styles.errorMessage} name={props.name} errors={errors}/>
    </div>
  )
})
SelectField.displayName = 'SelectField'
