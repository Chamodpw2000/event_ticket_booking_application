resource "aws_security_group" "k8s" {
  name        = "k8s-sg"
  description = "k8s-node-security"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH-access"
  }

  ingress {
    from_port   = 32399
    to_port     = 32399
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "nginx-ingress port"
  }

  ingress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    self        = true
    description = "Inter-node communication"
  }

  ingress {
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    self        = true
    description = "Kubernetes API server"
  }

  ingress {
    from_port   = 10251
    to_port     = 10252
    protocol    = "tcp"
    self        = true
    description = "Scheduler & Controller"
  }

  ingress {
    from_port   = 2379
    to_port     = 2380
    protocol    = "tcp"
    self        = true
    description = "etcd"
  }

  ingress {
    from_port   = 10250
    to_port     = 10250
    protocol    = "tcp"
    self        = true
    description = "kubeletAPI"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    ignore_changes = [ingress, egress, tags]
  }

  tags = {
    Name    = "${var.project_name}-k8s-sg"
    Project = var.project_name
  }
}