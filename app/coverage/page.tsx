"use client"

import { isTeacherPlan, User } from "@/lib/access"
import { UserType } from "@/lib/access"
import { useState, useEffect } from "react"
import { createClient } from "@/utils/supabase/client"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, BookOpen, Plus, CheckCircle, XCircle, Trash2, Zap, Check, X, CalendarIcon } from "lucide-react"
import { toast } from "sonner"
import type { Class, Unit, CoverageTopic, CoverageRecord, GroupedSubtopics } from "@/lib/types"

const getCoverageIntensity = (coveredOn: string): string => {
  const coverageDate = new Date(coveredOn)
  const now = new Date()
  const daysDiff = Math.floor((now.getTime() - coverageDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDiff <= 7) return "bg-green-600 text-white" // Very recent - dark
  if (daysDiff <= 30) return "bg-green-500 text-white" // Recent - medium dark
  if (daysDiff <= 90) return "bg-green-400 text-gray-900" // 3 months - medium
  if (daysDiff <= 180) return "bg-green-300 text-gray-900" // 6 months - lighter
  if (daysDiff <= 365) return "bg-green-200 text-gray-800" // 1 year - light
  if (daysDiff <= 730) return "bg-green-100 text-gray-700" // 2 years - very light
  return "bg-green-50 text-gray-600" // 2+ years - very faint
}

const compareVersionNumbers = (a: string, b: string): number => {
  const aParts = a.split(".").map(Number)
  const bParts = b.split(".").map(Number)
  const maxLength = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < maxLength; i++) {
    const aPart = aParts[i] || 0
    const bPart = bParts[i] || 0

    if (aPart !== bPart) {
      return aPart - bPart
    }
  }

  return 0
}

export default function CoveragePage() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string>("")
  const [groupedSubtopics, setGroupedSubtopics] = useState<GroupedSubtopics[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingSubtopics, setIsLoadingSubtopics] = useState(false)
  const [addingCoverageFor, setAddingCoverageFor] = useState<string | null>(null)
  const [newCoverageData, setNewCoverageData] = useState({
    coveredOn: new Date().toISOString().split("T")[0],
    notes: "",
  })
  const [selectedSubtopics, setSelectedSubtopics] = useState<Set<string>>(new Set())
  const [bulkMode, setBulkMode] = useState(false)
  const [isAddingBulk, setIsAddingBulk] = useState(false)
  const [bulkDate, setBulkDate] = useState(new Date().toISOString().split("T")[0])
  const [coverageFilter, setCoverageFilter] = useState<"all" | "covered" | "not-covered">("all")

  const supabase = createClient()

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        redirect("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("user_type").eq("userid", user.id).single()

      if (!profile?.user_type || !isTeacherPlan({ user_type: profile.user_type as UserType })) {
        redirect("/")
        return
      }

      const { data: teacherClasses, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("teacher_id", user.id)
        .order("name")

      if (classesError) {
        console.error("Error fetching classes:", classesError)
        toast.error("Failed to load classes")
      } else {
        setClasses(teacherClasses || [])
      }

      setIsLoading(false)
    }

    checkAccess()
  }, [supabase])

  useEffect(() => {
    if (selectedClass) {
      fetchSubtopicsWithCoverage()
    }
  }, [selectedClass])

  const fetchSubtopicsWithCoverage = async () => {
    if (!selectedClass) return

    setIsLoadingSubtopics(true)
    try {
      const { data: subtopics, error: subtopicsError } = await supabase
        .from("subtopics")
        .select(`
          id,
          subtopictitle,
          subtopicnumber,
          topic_id,
          topics!inner (
            id,
            name,
            description,
            slug,
            topicnumber,
            unit_id,
            units!inner (
              id,
              name,
              unit_number
            )
          )
        `)
        .order("subtopicnumber")

      if (subtopicsError) {
        console.error("Error fetching subtopics:", subtopicsError)
        toast.error("Failed to load subtopics")
        return
      }

      const { data: coverageRecords, error: coverageError } = await supabase
        .from("class_subtopic_coverage")
        .select("*")
        .eq("class_id", selectedClass)
        .order("covered_on", { ascending: false })

      if (coverageError) {
        console.error("Error fetching coverage records:", coverageError)
        if (coverageError.code === "42P01") {
          console.log("subtopic_coverage table does not exist yet - continuing with empty coverage")
        } else {
          toast.error("Failed to load coverage records")
          return
        }
      }

      const coverageBySubtopic = new Map<string, CoverageRecord[]>()
      coverageRecords?.forEach((record) => {
        if (!coverageBySubtopic.has(record.subtopic_id)) {
          coverageBySubtopic.set(record.subtopic_id, [])
        }
        coverageBySubtopic.get(record.subtopic_id)!.push(record)
      })

      const grouped: GroupedSubtopics[] = []

      subtopics?.forEach((subtopic) => {
        const topicData = Array.isArray(subtopic.topics) ? subtopic.topics[0] : subtopic.topics
        const unitData = Array.isArray(topicData.units) ? topicData.units[0] : topicData.units

        const topic: CoverageTopic = {
          id: topicData.id,
          name: topicData.name,
          description: topicData.description,
          slug: topicData.slug,
          topicnumber: topicData.topicnumber,
          unit_id: topicData.unit_id,
          units: unitData,
        }

        const unit: Unit = {
          id: unitData.id,
          name: unitData.name,
          unit_number: unitData.unit_number,
        }

        let unitGroup = grouped.find((g) => g.unit.id === unit.id)
        if (!unitGroup) {
          unitGroup = {
            unit,
            topics: [],
          }
          grouped.push(unitGroup)
        }

        let topicGroup = unitGroup.topics.find((t) => t.topic.id === topic.id)
        if (!topicGroup) {
          topicGroup = {
            topic,
            subtopics: [],
          }
          unitGroup.topics.push(topicGroup)
        }

        topicGroup.subtopics.push({
          ...subtopic,
          topics: topic,
          coverageRecords: coverageBySubtopic.get(subtopic.id) || [],
        })
      })

      grouped.sort((a, b) => a.unit.unit_number - b.unit.unit_number)
      grouped.forEach((unitGroup) => {
        unitGroup.topics.sort((a, b) =>
          compareVersionNumbers(a.topic.topicnumber.toString(), b.topic.topicnumber.toString()),
        )
        unitGroup.topics.forEach((topicGroup) => {
          topicGroup.subtopics.sort((a, b) =>
            compareVersionNumbers(a.subtopicnumber.toString(), b.subtopicnumber.toString()),
          )
        })
      })

      setGroupedSubtopics(grouped)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to load data")
    } finally {
      setIsLoadingSubtopics(false)
    }
  }

  const handleQuickCoverage = async (subtopicId: string, notes?: string) => {
    if (!selectedClass) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const newCoverageRecord = {
        id: `temp-${Date.now()}`, // Temporary ID for optimistic update
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: new Date().toISOString().split("T")[0],
        created_by: user.id,
        notes: notes || null,
      }

      setGroupedSubtopics((prev) =>
        prev.map((unitGroup) => ({
          ...unitGroup,
          topics: unitGroup.topics.map((topicGroup) => ({
            ...topicGroup,
            subtopics: topicGroup.subtopics.map((subtopic) =>
              subtopic.id === subtopicId
                ? { ...subtopic, coverageRecords: [newCoverageRecord, ...(subtopic.coverageRecords || [])] }
                : subtopic,
            ),
          })),
        })),
      )

      const { error } = await supabase.from("class_subtopic_coverage").insert({
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: new Date().toISOString().split("T")[0],
        created_by: user.id,
        notes: notes || null,
      })

      if (error) {
        console.error("Error adding coverage:", error)
        toast.error("Failed to add coverage record")
        fetchSubtopicsWithCoverage()
        return
      }

      toast.success("Marked as covered today")
      fetchSubtopicsWithCoverage()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to add coverage record")
      fetchSubtopicsWithCoverage()
    }
  }

  const handleAddCoverage = async (subtopicId: string) => {
    if (!selectedClass) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const newCoverageRecord = {
        id: `temp-${Date.now()}`,
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: newCoverageData.coveredOn,
        created_by: user.id,
        notes: newCoverageData.notes || null,
      }

      setGroupedSubtopics((prev) =>
        prev.map((unitGroup) => ({
          ...unitGroup,
          topics: unitGroup.topics.map((topicGroup) => ({
            ...topicGroup,
            subtopics: topicGroup.subtopics.map((subtopic) =>
              subtopic.id === subtopicId
                ? { ...subtopic, coverageRecords: [newCoverageRecord, ...(subtopic.coverageRecords || [])] }
                : subtopic,
            ),
          })),
        })),
      )

      const { error } = await supabase.from("class_subtopic_coverage").insert({
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: newCoverageData.coveredOn,
        created_by: user.id,
        notes: newCoverageData.notes || null,
      })

      if (error) {
        console.error("Error adding coverage:", error)
        toast.error("Failed to add coverage record")
        fetchSubtopicsWithCoverage()
        return
      }

      toast.success("Coverage record added successfully")
      setAddingCoverageFor(null)
      setNewCoverageData({
        coveredOn: new Date().toISOString().split("T")[0],
        notes: "",
      })

      fetchSubtopicsWithCoverage()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to add coverage record")
      fetchSubtopicsWithCoverage()
    }
  }

  const handleBulkCoverage = async () => {
    if (!selectedClass || selectedSubtopics.size === 0) return

    setIsAddingBulk(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not found")

      const newCoverageRecords = Array.from(selectedSubtopics).map((subtopicId) => ({
        id: `temp-${Date.now()}-${subtopicId}`,
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: bulkDate, // Use selected bulk date instead of hardcoded today
        created_by: user.id,
        notes: null,
      }))

      setGroupedSubtopics((prev) =>
        prev.map((unitGroup) => ({
          ...unitGroup,
          topics: unitGroup.topics.map((topicGroup) => ({
            ...topicGroup,
            subtopics: topicGroup.subtopics.map((subtopic) => {
              if (selectedSubtopics.has(subtopic.id)) {
                const newRecord = newCoverageRecords.find((r) => r.subtopic_id === subtopic.id)!
                return { ...subtopic, coverageRecords: [newRecord, ...(subtopic.coverageRecords || [])] }
              }
              return subtopic
            }),
          })),
        })),
      )

      const coverageRecords = Array.from(selectedSubtopics).map((subtopicId) => ({
        class_id: selectedClass,
        subtopic_id: subtopicId,
        covered_on: bulkDate, // Use selected bulk date
        created_by: user.id,
        notes: null,
      }))

      const { error } = await supabase.from("class_subtopic_coverage").insert(coverageRecords)

      if (error) {
        console.error("Error adding bulk coverage:", error)
        toast.error("Failed to add coverage records")
        fetchSubtopicsWithCoverage()
        return
      }

      toast.success(
        `Marked ${selectedSubtopics.size} subtopics as covered on ${new Date(bulkDate).toLocaleDateString()}`,
      )
      setSelectedSubtopics(new Set())
      setBulkMode(false)
      fetchSubtopicsWithCoverage()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to add coverage records")
      fetchSubtopicsWithCoverage()
    } finally {
      setIsAddingBulk(false)
    }
  }

  const toggleSubtopicSelection = (subtopicId: string) => {
    const newSelection = new Set(selectedSubtopics)
    if (newSelection.has(subtopicId)) {
      newSelection.delete(subtopicId)
    } else {
      newSelection.add(subtopicId)
    }
    setSelectedSubtopics(newSelection)
  }

  const selectAllUncovered = () => {
    const uncoveredSubtopics = new Set<string>()
    groupedSubtopics.forEach((unitGroup) => {
      unitGroup.topics.forEach((topicGroup) => {
        topicGroup.subtopics.forEach((subtopic) => {
          if (!subtopic.coverageRecords || subtopic.coverageRecords.length === 0) {
            uncoveredSubtopics.add(subtopic.id)
          }
        })
      })
    })
    setSelectedSubtopics(uncoveredSubtopics)
  }

  const handleDeleteCoverage = async (coverageId: string) => {
    try {
      setGroupedSubtopics((prev) =>
        prev.map((unitGroup) => ({
          ...unitGroup,
          topics: unitGroup.topics.map((topicGroup) => ({
            ...topicGroup,
            subtopics: topicGroup.subtopics.map((subtopic) => ({
              ...subtopic,
              coverageRecords: subtopic.coverageRecords?.filter((record) => record.id !== coverageId) || [],
            })),
          })),
        })),
      )

      const { error } = await supabase.from("class_subtopic_coverage").delete().eq("id", coverageId)

      if (error) {
        console.error("Error deleting coverage:", error)
        toast.error("Failed to delete coverage record")
        fetchSubtopicsWithCoverage()
        return
      }

      toast.success("Coverage record deleted")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to delete coverage record")
      fetchSubtopicsWithCoverage()
    }
  }

  const getCoverageStats = () => {
    let totalSubtopics = 0
    let coveredSubtopics = 0

    groupedSubtopics.forEach((unitGroup) => {
      unitGroup.topics.forEach((topicGroup) => {
        topicGroup.subtopics.forEach((subtopic) => {
          totalSubtopics++
          if (subtopic.coverageRecords && subtopic.coverageRecords.length > 0) {
            coveredSubtopics++
          }
        })
      })
    })

    return {
      total: totalSubtopics,
      covered: coveredSubtopics,
      notCovered: totalSubtopics - coveredSubtopics,
    }
  }

  const getFilteredSubtopics = () => {
    if (coverageFilter === "all") return groupedSubtopics

    return groupedSubtopics
      .map((unitGroup) => ({
        ...unitGroup,
        topics: unitGroup.topics
          .map((topicGroup) => ({
            ...topicGroup,
            subtopics: topicGroup.subtopics.filter((subtopic) => {
              const isCovered = subtopic.coverageRecords && subtopic.coverageRecords.length > 0
              return coverageFilter === "covered" ? isCovered : !isCovered
            }),
          }))
          .filter((topicGroup) => topicGroup.subtopics.length > 0),
      }))
      .filter((unitGroup) => unitGroup.topics.length > 0)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-3xl font-bold">Subtopic Coverage Tracker</h1>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Class</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <Card
                key={cls.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedClass === cls.id ? "ring-2 ring-blue-500 bg-blue-50" : ""
                }`}
                onClick={() => setSelectedClass(cls.id)}
              >
                <CardContent className="p-4">
                  <div className="font-medium">{cls.name}</div>
                  <div className="text-sm text-gray-500">Created {new Date(cls.created_at).toLocaleDateString()}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedClass && (
          <>
            <div className="mb-6 p-4 bg-white rounded-lg border">
              <h3 className="text-lg font-semibold mb-3">Coverage Filters</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant={coverageFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCoverageFilter("all")}
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    All ({getCoverageStats().total})
                  </Button>
                  <Button
                    variant={coverageFilter === "covered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCoverageFilter("covered")}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Covered ({getCoverageStats().covered})
                  </Button>
                  <Button
                    variant={coverageFilter === "not-covered" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCoverageFilter("not-covered")}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Not Covered ({getCoverageStats().notCovered})
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  {getCoverageStats().covered} of {getCoverageStats().total} subtopics covered (
                  {Math.round((getCoverageStats().covered / getCoverageStats().total) * 100) || 0}%)
                </div>
              </div>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-6">
                <Button
                  variant={bulkMode ? "default" : "outline"}
                  onClick={() => {
                    setBulkMode(!bulkMode)
                    setSelectedSubtopics(new Set())
                  }}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  {bulkMode ? "Exit Bulk Mode" : "Bulk Select"}
                </Button>

                {bulkMode && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllUncovered}
                      className="flex items-center gap-2 bg-transparent"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Select All Uncovered
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedSubtopics(new Set())}
                      className="flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      Clear Selection
                    </Button>
                  </>
                )}
              </div>

              {bulkMode && selectedSubtopics.size > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{selectedSubtopics.size} selected</span>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="bulk-date" className="text-sm whitespace-nowrap">
                      Coverage Date:
                    </Label>
                    <Input
                      id="bulk-date"
                      type="date"
                      value={bulkDate}
                      onChange={(e) => setBulkDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                  <Button onClick={handleBulkCoverage} disabled={isAddingBulk} className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    {isAddingBulk ? "Adding..." : "Mark All as Covered"}
                  </Button>
                </div>
              )}
            </div>

            {isLoadingSubtopics ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {[...Array(2)].map((_, j) => (
                          <div key={j} className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                {getFilteredSubtopics().map((unitGroup) => (
                  <Card key={unitGroup.unit.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Badge variant="outline">Unit {unitGroup.unit.unit_number}</Badge>
                        {unitGroup.unit.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {unitGroup.topics.map((topicGroup) => (
                        <div key={topicGroup.topic.id} className="border-l-2 border-gray-200 pl-4">
                          <h3 className="font-semibold text-lg mb-3">
                            Topic {topicGroup.topic.topicnumber}: {topicGroup.topic.name}
                          </h3>
                          <div className="space-y-3">
                            {topicGroup.subtopics.map((subtopic) => (
                              <div
                                key={subtopic.id}
                                className={`border rounded-lg p-4 transition-all ${
                                  bulkMode
                                    ? selectedSubtopics.has(subtopic.id)
                                      ? "bg-blue-50 border-blue-300 cursor-pointer hover:bg-blue-100"
                                      : "bg-gray-50 cursor-pointer hover:bg-gray-100"
                                    : "bg-gray-50"
                                }`}
                                onClick={bulkMode ? () => toggleSubtopicSelection(subtopic.id) : undefined}
                              >
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    {bulkMode && (
                                      <Checkbox
                                        checked={selectedSubtopics.has(subtopic.id)}
                                        onCheckedChange={() => toggleSubtopicSelection(subtopic.id)}
                                        onClick={(e) => e.stopPropagation()}
                                      />
                                    )}

                                    {subtopic.coverageRecords && subtopic.coverageRecords.length > 0 ? (
                                      <CheckCircle className="h-5 w-5 text-green-600" />
                                    ) : (
                                      <XCircle className="h-5 w-5 text-gray-400" />
                                    )}
                                    <div className="font-medium">
                                      {subtopic.subtopicnumber}. {subtopic.subtopictitle}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    {(!subtopic.coverageRecords || subtopic.coverageRecords.length === 0) &&
                                      !bulkMode && (
                                        <Button
                                          variant="default"
                                          size="sm"
                                          onClick={() => handleQuickCoverage(subtopic.id)}
                                          className="flex items-center gap-1 bg-green-600 hover:bg-green-700"
                                        >
                                          <Zap className="h-3 w-3" />
                                          Covered Today
                                        </Button>
                                      )}

                                    {!bulkMode && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setAddingCoverageFor(subtopic.id)}
                                        className="flex items-center gap-1"
                                      >
                                        <CalendarIcon className="h-3 w-3" />
                                        Custom Date
                                      </Button>
                                    )}
                                  </div>
                                </div>

                                {subtopic.coverageRecords && subtopic.coverageRecords.length > 0 && (
                                  <div className="space-y-2 mb-3">
                                    {subtopic.coverageRecords.map((coverage) => (
                                      <div
                                        key={coverage.id}
                                        className={`flex items-center justify-between p-2 rounded text-sm ${getCoverageIntensity(coverage.covered_on)}`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Calendar className="h-3 w-3" />
                                          <span>{new Date(coverage.covered_on).toLocaleDateString()}</span>
                                          {coverage.notes && <span className="opacity-80">- {coverage.notes}</span>}
                                        </div>
                                        {!bulkMode && (
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteCoverage(coverage.id)
                                            }}
                                            className="h-6 w-6 p-0 hover:bg-red-100"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </Button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {addingCoverageFor === subtopic.id && (
                                  <div className="border-t pt-3 space-y-3">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                      <div>
                                        <Label htmlFor="date" className="text-sm">
                                          Date Covered
                                        </Label>
                                        <Input
                                          id="date"
                                          type="date"
                                          value={newCoverageData.coveredOn}
                                          onChange={(e) =>
                                            setNewCoverageData((prev) => ({ ...prev, coveredOn: e.target.value }))
                                          }
                                          className="mt-1"
                                        />
                                      </div>
                                      <div>
                                        <Label htmlFor="notes" className="text-sm">
                                          Notes (Optional)
                                        </Label>
                                        <Input
                                          id="notes"
                                          placeholder="Add notes about the coverage"
                                          value={newCoverageData.notes}
                                          onChange={(e) =>
                                            setNewCoverageData((prev) => ({ ...prev, notes: e.target.value }))
                                          }
                                          className="mt-1"
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        onClick={() => handleAddCoverage(subtopic.id)}
                                        size="sm"
                                        className="flex items-center gap-1"
                                      >
                                        <Plus className="h-3 w-3" />
                                        Add Coverage
                                      </Button>
                                      <Button variant="outline" size="sm" onClick={() => setAddingCoverageFor(null)}>
                                        Cancel
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
