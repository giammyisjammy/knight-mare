import * as React from 'react'

import MembershipForm from './MembershipForm'
import { SubmitHandler } from 'react-hook-form'

import { api } from '@/lib/config'
import fetcher from '@/lib/fetcher'
import { IClubMemberDTO } from '@/lib/ClubMember'

export default function NewMembershipPage() {
  const onConfirm: SubmitHandler<IClubMemberDTO> = async (formData) => {
    console.log('New subscription', formData)
    try {
      const result = await fetcher(api.createDatabaseEntry, {
        method: 'POST',
        body: JSON.stringify(formData)
      })
      console.log('Success!', result)
    } catch (error) {
      console.log('Failed =(', error)
    }
  }

  return <MembershipForm mode='add' onConfirm={onConfirm} />
}
