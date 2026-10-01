import React, { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import TextField from '../../../components/controlled/TextField'
import ControlledTable from '../../../components/uncontrolled/ControlledTable'
import { Button } from '../../../components/controlled'
import { IconField } from '../../../components'
import { useTranslation } from 'react-i18next'
import { getPagesDataText } from '../../../helpers/useTranslations'
import {
  useRoutes,
  useAddRoute,
  useUpdateRoute,
  useDeleteRoute,
  useDeleteMultipleRoutes,
} from '../../../hooks/queries/transport/useRoutes'
import type { Route } from '../../../types/transport/routes'
import { toast } from 'react-toastify'
import { confirmToast } from '../../../helpers/confirmToast'
import AllSchoolDropdown from '../../../components/uncontrolled/AllSchoolDropdown'

interface RouteForm {
  routetitle: string
}

function RoutesPage() {
  const { handleSubmit, control, reset, setValue } = useForm<RouteForm>({
    defaultValues: {
      routetitle: '',
    },
  })

  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>('')

  const { data: routes = [], isLoading } = useRoutes()
  const { mutateAsync: addRoute } = useAddRoute()
  const { mutateAsync: updateRoute } = useUpdateRoute()
  const { mutateAsync: deleteRoute } = useDeleteRoute()
  const { mutateAsync: deleteMultipleRoutes } = useDeleteMultipleRoutes()

  const onSubmit: SubmitHandler<RouteForm> = async (data) => {
    try {
      if (editingId !== null) {
        await updateRoute({
          id: editingId,
          data: { routeTitle: data.routetitle },
        })
        toast.success('Route updated successfully!')
        setEditingId(null)
      } else {
        await addRoute({ routeTitle: data.routetitle })
        toast.success('Route created successfully!')
      }
      reset()
    } catch (error: any) {
      toast.error(error.message || 'Operation failed. Please try again.')
    }
  }

  const handleCancel = () => {
    reset()
    setEditingId(null)
  }

  const handleEdit = (id: string | number) => {
    const routeId = id.toString()
    const item = routes.find((d: Route) => d.id === routeId)
    if (item) {
      setValue('routetitle', item.routeTitle)
      setEditingId(routeId)
    }
  }

  const handleDelete = async (id: string | number) => {
    if (await confirmToast('Do you want to delete this route?')) {
      try {
        await deleteRoute(id.toString())
        toast.success('Route deleted successfully!')
        if (editingId !== null && editingId === id.toString()) {
          reset()
          setEditingId(null)
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete route.')
      }
    }
  }

  const handleDeleteAll = async (ids: (string | number)[]) => {
    if (await confirmToast(`Delete ${ids.length} selected route(s)?`)) {
      try {
        const stringIds = ids.map((id) => id.toString())
        await deleteMultipleRoutes(stringIds)
        toast.success('Selected routes deleted successfully!')

        if (editingId !== null && stringIds.includes(editingId)) {
          reset()
          setEditingId(null)
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete routes.')
      }
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredRoutes = routes
    .filter((item: Route) => item.routeTitle?.toLowerCase().includes(searchTerm.toLowerCase()))
    .map((item: Route) => ({
      id: item.id,
      routetitle: item.routeTitle,
    }))

  const { t } = useTranslation()
  const Create_Route_Text = getPagesDataText(t)
  const Route_Title_Text = getPagesDataText(t)
  const Route_List_Text = getPagesDataText(t)
  const Save_Text = getPagesDataText(t)
  const Update_Text = getPagesDataText(t)
  const Cancel_Text = getPagesDataText(t)

  const tableColumns = [{ label: Route_Title_Text.Route_Title, key: 'routetitle' }]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading routes data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col lg:flex-row justify-between p-4 space-y-4 lg:space-y-0 w-full">
      <div className="w-full lg:w-1/3 p-4 bg-white rounded-md shadow-2xl mt-4">
        <h1 className="mb-4 text-black text-xl font-medium capitalize">
          {editingId !== null ? Update_Text.Update : Create_Route_Text.Create_Route}
        </h1>

        <AllSchoolDropdown onSubmit={handleSubmit(onSubmit)}>
          <TextField
            name="routetitle"
            required={true}
            label={Route_Title_Text.Route_Title}
            placeholder="Enter Route Title"
            control={control}
          />
          <div className="flex items-center justify-end gap-2 mb-2">
            {editingId !== null && (
              <Button
                name={Cancel_Text.Cancel}
                loading={false}
                icon={<IconField name="FaTimes" size={16} />}
                onClick={handleCancel}
              />
            )}
            <Button
              name={editingId === null ? Save_Text.Save : Update_Text.Update}
              loading={false}
              icon={<IconField name="FaSave" size={16} />}
              permissionScope="TRANSPORT"
              permissionType={editingId ? 'UPDATE' : 'CREATE'}
              enablePermissions={true}
            />
          </div>
        </AllSchoolDropdown>
      </div>

      <div className="p-2 w-full lg:w-2/3">
        <ControlledTable
          columns={tableColumns}
          data={filteredRoutes}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onDeleteMultiple={handleDeleteAll}
          title={Route_List_Text.Route_List}
          actionColumn={true}
          showSelectAll={true}
          enablePermissions={true}
          permissionScope="TRANSPORT"
        />
      </div>
    </div>
  )
}

export default RoutesPage
