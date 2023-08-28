import * as React from 'react'
import {
  useForm,
  FormProvider,
  UseFormReturn,
  useFormContext,
  PathString
} from 'react-hook-form'
import { IMaskInput } from 'react-imask'
import cs from 'classnames'
import { ErrorMessage } from '@hookform/error-message'

import { ClubMember } from '@/lib/ClubMember'

import styles from './MembershipForm.module.css'

export const MembershipFormProvider: React.FC<{
  defaultValues?: ClubMember
  children: (
    methods: UseFormReturn<ClubMember, any, undefined>
  ) => React.ReactNode
}> = ({ defaultValues, children }) => {
  const methods = useForm<ClubMember>({ defaultValues })

  console.log(methods.formState.errors)

  return <FormProvider {...methods}>{children(methods)}</FormProvider>
}

type FormField<T> = T & {
  label: PathString
}

type InputFieldProps = FormField<React.InputHTMLAttributes<HTMLInputElement>>
export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, ...props }, ref) => {
    const {
      formState: { errors }
    } = useFormContext()

    return (
      <div
        className={cs(styles.field, {
          [styles.checkboxField]: props.type === 'checkbox'
        })}
      >
        <label className={cs({ [styles.errorLabel]: !!errors[props.name] })}>
          {label}
        </label>
        {/* <VisuallyHidden>{label}</VisuallyHidden> */}
        <input {...props} ref={ref} />
        <ErrorMessage
          as='span'
          className={styles.errorMessage}
          name={props.name}
          errors={errors}
        />
      </div>
    )
  }
)
InputField.displayName = 'InputField'

type SelectFieldProps = FormField<React.SelectHTMLAttributes<HTMLSelectElement>>
export const SelectField = React.forwardRef<
  HTMLSelectElement,
  SelectFieldProps
>(({ label, ...props }, ref) => {
  const {
    formState: { errors }
  } = useFormContext()

  return (
    <div className={styles.field}>
      <label className={cs({ [styles.errorLabel]: !!errors[props.name] })}>
        {label}
      </label>
      {/* <VisuallyHidden>{label}</VisuallyHidden> */}
      <select {...props} ref={ref} />
      <ErrorMessage
        as='span'
        className={styles.errorMessage}
        name={props.name}
        errors={errors}
      />
    </div>
  )
})
SelectField.displayName = 'SelectField'

interface TextMaskCustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void
  name: string
}
export const TextMaskCustom = React.forwardRef<
  HTMLElement,
  TextMaskCustomProps
>((props, ref) => {
  const { onChange, ...other } = props
  return (
    <IMaskInput
      {...other}
      mask='(+39) 000-000-0000'
      // definitions={{
      //   '#': /[1-9]/,
      // }}
      inputRef={ref as React.ForwardedRef<HTMLInputElement>}
      onAccept={(value: any) =>
        onChange({ target: { name: props.name, value } })
      }
      overwrite
    />
  )
})
