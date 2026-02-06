{{/*
Create the container images
*/}}
{{- define "unikorn.defaultTag" -}}
v{{ .Chart.Version }}
{{- end }}

{{- define "unikorn-ui.image" -}}
{{- .Values.image | default (printf "%s/unikorn-ui:%s" (include "unikorn.defaultRepositoryPath" .) (.Values.tag | default (include "unikorn.defaultTag" .))) }}
{{- end }}

{{/*
Create image pull secrets
*/}}
{{- define "unikorn-ui.imagePullSecrets" -}}
{{- if .Values.imagePullSecret -}}
- name: {{ .Values.imagePullSecret }}
{{ end }}
{{- if .Values.dockerConfig -}}
- name: unikorn-ui-docker-config
{{- end }}
{{- end }}

{{- define "unikorn.ui.host" -}}
{{- if (and .Values.global .Values.global.ui .Values.global.ui.host) -}}
{{- .Values.global.ui.host }}
{{- else }}
{{- .Values.ui.host }}
{{- end }}
{{- end }}
