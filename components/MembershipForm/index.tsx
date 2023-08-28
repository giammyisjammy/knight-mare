import * as React from 'react'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Input from '@mui/material/Input'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import Checkbox from '@mui/material/Checkbox'
import MenuItem from '@mui/material/MenuItem'
import Link from '@mui/material/Link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { SubmitHandler, SubmitErrorHandler } from 'react-hook-form'
import { FormContainer } from 'react-hook-form-mui'

import { ClubMember } from '@/lib/ClubMember'

import styles from './MembershipForm.module.css'
import {
  InputField,
  MembershipFormProvider,
  TextMaskCustom,
  SelectField
} from './components'
import { validators } from './validators'

// import VisuallyHidden from './VisuallyHidden'

function Copyright(props: any) {
  return (
    <Typography
      variant='body2'
      color='text.secondary'
      align='center'
      {...props}
    >
      {'Copyright © '}
      <Link color='inherit' href='https://mui.com/'>
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  )
}

// TODO remove, this demo shouldn't need to reset the theme.
const defaultTheme = createTheme()

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
    <>
      <ThemeProvider theme={defaultTheme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <FormContainer
            defaultValues={defaultValues}
            onSuccess={(data) => {
              // TODO non arriva una fava di dati
              console.log('porcodio', data)
            }}
            // onSuccess={onConfirm}
            onError={onInvalid}
            // onSuccess={
            //   // HACK
            //   (formData: ClubMember) => {
            //     onConfirm(
            //       new ClubMember(
            //         formData.firstName,
            //         formData.lastName,
            //         formData.paymentStatus,
            //         formData.CAP,
            //         formData.fiscalCode,
            //         formData.privacyConsent,
            //         formData.imagesConsent,
            //         formData.creationDate,
            //         new Date(formData.birthDate),
            //         formData.email,
            //         formData.address,
            //         formData.birthPlace,
            //         formData.birthProvince,
            //         formData.cityProvince,
            //         formData.city,
            //         formData.membershipStatus,
            //         formData.phoneNr,
            //         formData.membershipType,
            //         formData.lastEdit
            //       )
            //     )
            //   }
            // }
          >
            <Container
              component='main'
              className={className} /* maxWidth='xs' */
            >
              <CssBaseline />
              <Box
                sx={{
                  marginTop: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <Box>
                  <TextField
                    id='firstName'
                    margin='normal'
                    required
                    fullWidth
                    label='Nome'
                    name='firstName'
                    autoComplete='name'
                    autoFocus
                  />
                  <TextField
                    id='lastName'
                    margin='normal'
                    required
                    fullWidth
                    label='Cognome'
                    name='lastName'
                    autoComplete='surname'
                  />
                  <TextField
                    id='fiscalCode'
                    margin='normal'
                    required
                    fullWidth
                    label='Codice Fiscale'
                    name='fiscalCode'
                    autoComplete='fiscalCode'
                  />
                  <TextField
                    id='email'
                    margin='normal'
                    required
                    fullWidth
                    label='Indirizzo Email'
                    name='email'
                    autoComplete='email'
                  />
                  <TextField
                    id='address'
                    margin='normal'
                    required
                    fullWidth
                    label='Indirizzo'
                    name='address'
                    autoComplete='address'
                  />
                  <TextField
                    id='birthPlace'
                    margin='normal'
                    required
                    fullWidth
                    label='Nato/a a'
                    name='birthPlace'
                    autoComplete='birthPlace'
                  />
                  <TextField
                    id='city'
                    margin='normal'
                    required
                    fullWidth
                    label='Residente in'
                    name='city'
                    autoComplete='city'
                  />

                  {/* TODO il telefono è un porcodio */}
                  <FormControl
                    variant='standard'
                    margin='normal'
                    required
                    fullWidth
                  >
                    <InputLabel htmlFor='formatted-text-mask-input'>
                      Telefono
                    </InputLabel>
                    <Input
                      // value={values.textmask}
                      // onChange={handleChange}
                      name='textmask'
                      id='formatted-text-mask-input'
                      inputComponent={TextMaskCustom as any}
                    />
                  </FormControl>
                  {/* TODO fine del porcodio */}

                  <TextField
                    id='CAP'
                    margin='normal'
                    required
                    fullWidth
                    label='CAP'
                    name='CAP'
                    autoComplete='CAP'
                  />
                  <TextField
                    id='birthProvince'
                    margin='normal'
                    required
                    fullWidth
                    label='Provincia di Nascita'
                    name='birthProvince'
                    autoComplete='birthProvince'
                  />
                  <TextField
                    id='cityProvince'
                    margin='normal'
                    required
                    fullWidth
                    label='Provincia di Residenza'
                    name='cityProvince'
                    autoComplete='cityProvince'
                  />
                  <TextField
                    id='membershipType'
                    select
                    margin='normal'
                    required
                    fullWidth
                    label='Tipologia Affiliazione'
                    defaultValue='Socio Adulto Ordinario Annuale'
                  >
                    {[
                      'Socio Adulto Ordinario Annuale',
                      'Socio Under18',
                      'Socio Sostenitore'
                      // 'Socio Onorario',
                    ].map((value) => (
                      <MenuItem key={value} value={value}>
                        {/* {label} */}
                        {value}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* TODO data di nascita è un alro porcodio */}
                  <FormControl
                    variant='standard'
                    margin='normal'
                    required
                    fullWidth
                  >
                    <DatePicker
                      label='Data di Nascita'
                      // sx={{ mt: 2, mb: 1 }} // same as margin='normal'
                      // required
                      // fullWidth
                      disableFuture
                    />
                  </FormControl>

                  {/* TODO altro porcodio */}
                  <FormControl
                    variant='standard'
                    margin='normal'
                    required
                    fullWidth
                  >
                    <FormControlLabel
                      control={
                        <Checkbox value='privacyConsent' color='primary' />
                      }
                      label='Consenso Privacy'
                    />
                  </FormControl>
                  {/* TODO altro porcodio */}
                  <FormControl
                    variant='standard'
                    margin='normal'
                    required
                    fullWidth
                  >
                    <FormControlLabel
                      control={
                        <Checkbox value='imagesConsent' color='primary' />
                      }
                      label='Consenso Trattamento Immagini'
                    />
                  </FormControl>

                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Invia
                  </Button>
                </Box>
              </Box>
              <Copyright sx={{ mt: 8, mb: 4 }} />
            </Container>
          </FormContainer>
        </LocalizationProvider>
      </ThemeProvider>

      <MembershipFormProvider defaultValues={defaultValues}>
        {({ register, handleSubmit }) => (
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
                {...register('firstName', {
                  ...validators.required(),
                  ...validators.maxLength(80)
                })}
              />
              <InputField
                label='Cognome'
                placeholder='Cognome'
                {...register('lastName', {
                  ...validators.required(),
                  ...validators.maxLength(100)
                })}
              />
              <InputField
                label='Codice Fiscale'
                placeholder='Codice Fiscale'
                {...register('fiscalCode', {
                  ...validators.required(),
                  ...validators.fiscalCode()
                })}
              />
              <InputField
                label='Email'
                placeholder='Email'
                {...register('email', {
                  ...validators.required(),
                  ...validators.email()
                })}
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
                {...register('CAP', {
                  ...validators.required(),
                  ...validators.CAP()
                })}
              />
              <InputField
                label='Provincia di Nascita'
                placeholder='Provincia di Nascita'
                {...register('birthProvince', {
                  ...validators.required(),
                  ...validators.maxLength(2)
                })}
              />
              <InputField
                label='Provincia di Residenza'
                placeholder='Provincia residenza'
                {...register('cityProvince', {
                  ...validators.required(),
                  ...validators.maxLength(2)
                })}
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
        )}
      </MembershipFormProvider>
    </>
  )
}
