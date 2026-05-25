'use client'

import {createClient} from '@/lib/supabase/client'
import {useEffect, useState} from 'react'
export default function Page() {
  const [courses, setCourses] = useState<any[] | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const controller = new AbortController()
    const getCourses = async () => {

      const { data,error } = await supabase.from('course').select()
      if (error) {
        console.error('Error fetching courses:', error)
      } else {
        setCourses(data)
      }
    }
    getCourses()

    return () => {
      controller.abort()
    }
  }, [])

  return <pre>{JSON.stringify(courses, null, 2)}</pre>
}