import { createClient } from "@/lib/supabase/server"

export interface StarMapData {
  id?: string
  title: string
  subtitle?: string
  date: string
  location: string
  latitude: number
  longitude: number
  theme: string
  show_constellations: boolean
  show_grid: boolean
  user_id?: string
  created_at?: string
  updated_at?: string
}

export async function saveStarMap(starMapData: Omit<StarMapData, "id" | "user_id" | "created_at" | "updated_at">) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("star_maps")
    .insert({
      ...starMapData,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to save star map: ${error.message}`)
  }

  return data
}

export async function getUserStarMaps() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("star_maps")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch star maps: ${error.message}`)
  }

  return data
}

export async function getStarMapById(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase.from("star_maps").select("*").eq("id", id).eq("user_id", user.id).single()

  if (error) {
    throw new Error(`Failed to fetch star map: ${error.message}`)
  }

  return data
}

export async function updateStarMap(
  id: string,
  starMapData: Partial<Omit<StarMapData, "id" | "user_id" | "created_at" | "updated_at">>,
) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("star_maps")
    .update(starMapData)
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update star map: ${error.message}`)
  }

  return data
}

export async function deleteStarMap(id: string) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase.from("star_maps").delete().eq("id", id).eq("user_id", user.id)

  if (error) {
    throw new Error(`Failed to delete star map: ${error.message}`)
  }

  return true
}
