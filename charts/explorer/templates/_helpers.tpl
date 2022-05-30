{{/* vim: set filetype=mustache: */}}
{{/*
Expand the name of the chart.
*/}}
{{- define "explorer.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "explorer.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "explorer.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "explorer.labels" -}}
helm.sh/chart: {{ include "explorer.chart" . }}
{{ include "explorer.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "explorer.mariadb.fullname" -}}
{{- printf "%s-%s" .Release.Name "mariadb" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{- define "explorer.mongo.fullname" -}}
{{- if .Values.mongo.fullnameOverride -}}
{{- .Values.mongo.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.mongo.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name "mongo" | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Set the final MongoDB connection URL
*/}}
{{- define "mongodb.url" -}}
{{- printf "%s://%s-%s/%s" "mongodb" .Release.Name "mongodb:27017" "explorer" | quote -}}
{{- end -}}

{{/*
Create unified laber for explorer.components
*/}}

{{- define "explorer.common.selectorLabels" -}}
helm.sh/chart: {{ include "explorer.chart" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
release: {{ .Release.Name }}
{{- end -}}

{{- define "explorer.common.metaLabels" -}}
chart: {{ .Chart.Name }}-{{ .Chart.Version }}
heritage: {{ .Release.Service }}
{{- end -}}


{{- define "explorer.faucet.labels" -}}
{{ include "explorer.faucet.selectorLabels" . }}
{{- end -}}

{{- define "explorer.faucet.selectorLabels" -}}
component: {{ .Values.faucet.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}

{{- define "explorer.syncer.labels" -}}
{{ include "explorer.syncer.selectorLabels" . }}
{{- end -}}

{{- define "explorer.syncer.selectorLabels" -}}
component: {{ .Values.syncer.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}

{{- define "explorer.delegation.labels" -}}
{{ include "explorer.delegation.selectorLabels" . }}
{{- end -}}

{{- define "explorer.delegation.selectorLabels" -}}
component: {{ .Values.delegation.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}

{{- define "explorer.stats.labels" -}}
{{ include "explorer.stats.selectorLabels" . }}
{{- end -}}

{{- define "explorer.stats.selectorLabels" -}}
component: {{ .Values.stats.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}

{{- define "explorer.webSocket.labels" -}}
{{ include "explorer.webSocket.selectorLabels" . }}
{{- end -}}

{{- define "explorer.webSocket.selectorLabels" -}}
component: {{ .Values.webSocket.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}

{{- define "explorer.sandbox.labels" -}}
{{ include "explorer.sandbox.selectorLabels" . }}
{{- end -}}

{{- define "explorer.sandbox.selectorLabels" -}}
component: {{ .Values.sandbox.name | quote }}
{{ include "explorer.common.selectorLabels" . }}
{{ include "explorer.common.metaLabels" . }}
{{- end -}}


{{/*
Selector labels
*/}}
{{- define "explorer.selectorLabels" -}}
app.kubernetes.io/name: {{ include "explorer.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "explorer.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}


{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.faucet.serviceAccountName" -}}
{{- if .Values.faucet.serviceAccount.create }}
{{- default (include "explorer.faucet.fullname" .) .Values.faucet.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.faucet.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.webSocket.serviceAccountName" -}}
{{- if .Values.webSocket.serviceAccount.create }}
{{- default (include "explorer.webSocket.fullname" .) .Values.webSocket.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.webSocket.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.syncer.serviceAccountName" -}}
{{- if .Values.syncer.serviceAccount.create }}
{{- default (include "explorer.syncer.fullname" .) .Values.syncer.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.syncer.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.delegation.serviceAccountName" -}}
{{- if .Values.delegation.serviceAccount.create }}
{{- default (include "explorer.delegation.fullname" .) .Values.delegation.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.delegation.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.stats.serviceAccountName" -}}
{{- if .Values.stats.serviceAccount.create }}
{{- default (include "explorer.stats.fullname" .) .Values.stats.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.stats.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "explorer.sandbox.serviceAccountName" -}}
{{- if .Values.sandbox.serviceAccount.create }}
{{- default (include "explorer.sandbox.fullname" .) .Values.sandbox.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.sandbox.serviceAccount.name }}
{{- end }}
{{- end }}


{{/*
faucet helpers
*/}}

{{- define "explorer.faucet.name" -}}
{{- default .Chart.Name .Values.faucet.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.faucet.fullname" -}}
{{- if .Values.faucet.fullnameOverride }}
{{- .Values.faucet.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.faucet.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.faucet.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}

{{/*
webSocket helpers
*/}}

{{- define "explorer.webSocket.name" -}}
{{- default .Chart.Name .Values.webSocket.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.webSocket.fullname" -}}
{{- if .Values.webSocket.fullnameOverride }}
{{- .Values.webSocket.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.webSocket.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.webSocket.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}


{{/*
sandbox helpers
*/}}

{{- define "explorer.sandbox.name" -}}
{{- default .Chart.Name .Values.sandbox.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.sandbox.fullname" -}}
{{- if .Values.sandbox.fullnameOverride }}
{{- .Values.sandbox.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.sandbox.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.sandbox.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}


{{/*
syncer helpers
*/}}

{{- define "explorer.syncer.name" -}}
{{- default .Chart.Name .Values.syncer.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.syncer.fullname" -}}
{{- if .Values.syncer.fullnameOverride }}
{{- .Values.syncer.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.syncer.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.syncer.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}


{{/*
delegation helpers
*/}}

{{- define "explorer.delegation.name" -}}
{{- default .Chart.Name .Values.delegation.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.delegation.fullname" -}}
{{- if .Values.delegation.fullnameOverride }}
{{- .Values.delegation.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.delegation.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.delegation.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}

{{/*
stats helpers
*/}}

{{- define "explorer.stats.name" -}}
{{- default .Chart.Name .Values.stats.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "explorer.stats.fullname" -}}
{{- if .Values.stats.fullnameOverride }}
{{- .Values.stats.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- printf "%s-%s" .Release.Name .Values.stats.name | trunc 63 | trimSuffix "-" -}}
{{- else }}
{{- printf "%s-%s-%s" .Release.Name $name .Values.stats.name | trunc 63 | trimSuffix "-" -}}
{{- end }}
{{- end }}
{{- end }}


{{/*
Call nested helpers
*/}}

{{- define "call-nested" }}
{{- $dot := index . 0 }}
{{- $subchart := index . 1 | splitList "." }}
{{- $template := index . 2 }}
{{- $values := $dot.Values }}
{{- range $subchart }}
{{- $values = index $values . }}
{{- end }}
{{- include $template (dict "Chart" (dict "Name" (last $subchart)) "Values" $values "Release" $dot.Release "Capabilities" $dot.Capabilities) }}
{{- end }}


{{- define "explorer.hostname" -}}
{{- if .Values.hostnameOverride -}}
{{- .Values.hostnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s.%s" "explorer" .Release.Name .Values.domain | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "explorer.websocket.hostname" -}}
{{- if .Values.webSocket.hostnameOverride -}}
{{- .Values.webSocket.hostnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s.%s" "explorer-ws" .Release.Name .Values.domain | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{- define "explorer.sandbox.hostname" -}}
{{- if .Values.sandbox.hostnameOverride -}}
{{- .Values.sandbox.hostnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s.%s" "sandbox" .Release.Name .Values.domain | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}

{{/* Allow KubeVersion to be overridden. */}}
{{- define "explorer.kubeVersion" -}}
  {{- default .Capabilities.KubeVersion.Version .Values.kubeVersionOverride -}}
{{- end -}}

{{/* Get Ingress API Version */}}
{{- define "explorer.ingress.apiVersion" -}}
  {{- if and (.Capabilities.APIVersions.Has "networking.k8s.io/v1") (semverCompare ">= 1.19-0" (include "explorer.kubeVersion" .)) -}}
      {{- print "networking.k8s.io/v1" -}}
  {{- else if .Capabilities.APIVersions.Has "networking.k8s.io/v1beta1" -}}
    {{- print "networking.k8s.io/v1beta1" -}}
  {{- else -}}
    {{- print "extensions/v1beta1" -}}
  {{- end -}}
{{- end -}}

{{/* Check Ingress stability */}}
{{- define "explorer.ingress.isStable" -}}
  {{- eq (include "explorer.ingress.apiVersion" .) "networking.k8s.io/v1" -}}
{{- end -}}

{{/* Check Ingress supports pathType */}}
{{/* pathType was added to networking.k8s.io/v1beta1 in Kubernetes 1.18 */}}
{{- define "explorer.ingress.supportsPathType" -}}
  {{- or (eq (include "explorer.ingress.isStable" .) "true") (and (eq (include "explorer.ingress.apiVersion" .) "networking.k8s.io/v1beta1") (semverCompare ">= 1.18-0" (include "explorer.kubeVersion" .))) -}}
{{- end -}}
