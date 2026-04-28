# ── k8s-master ────────────────────────────────────────────────
resource "aws_instance" "k8s_master" {
  ami               = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = aws_subnet.main.id
  key_name          = var.key_name
  availability_zone = var.availability_zone

  vpc_security_group_ids = [aws_security_group.k8s.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  lifecycle {
    ignore_changes = [
      ami,
      user_data,
      root_block_device,
      subnet_id,
      vpc_security_group_ids,
      security_groups,
      associate_public_ip_address,
      tags,
    ]
  }

  tags = {
    Name    = "k8s-master"
    Role    = "master"
    Project = var.project_name
  }
}

# ── k8s-worker-1 ──────────────────────────────────────────────
resource "aws_instance" "k8s_worker_1" {
  ami               = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = aws_subnet.main.id
  key_name          = var.key_name
  availability_zone = var.availability_zone

  vpc_security_group_ids = [aws_security_group.k8s.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  lifecycle {
    ignore_changes = [
      ami,
      user_data,
      root_block_device,
      subnet_id,
      vpc_security_group_ids,
      security_groups,
      associate_public_ip_address,
      tags,
    ]
  }

  tags = {
    Name    = "k8s-worker-1"
    Role    = "worker"
    Project = var.project_name
  }
}

# ── k8s-worker-2 ──────────────────────────────────────────────
resource "aws_instance" "k8s_worker_2" {
  ami               = var.ami_id
  instance_type     = var.instance_type
  subnet_id         = aws_subnet.main.id
  key_name          = var.key_name
  availability_zone = var.availability_zone

  vpc_security_group_ids = [aws_security_group.k8s.id]

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  lifecycle {
    ignore_changes = [
      ami,
      user_data,
      root_block_device,
      subnet_id,
      vpc_security_group_ids,
      security_groups,
      associate_public_ip_address,
      tags,
    ]
  }

  tags = {
    Name    = "k8s-worker-2"
    Role    = "worker"
    Project = var.project_name
  }
}

# ── Elastic IPs ───────────────────────────────────────────────
resource "aws_eip" "k8s_master" {
  instance = aws_instance.k8s_master.id
  domain   = "vpc"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [instance, tags]
  }

  tags = {
    Name    = "k8s-master-eip"
    Project = var.project_name
  }
}

resource "aws_eip" "k8s_worker_1" {
  instance = aws_instance.k8s_worker_1.id
  domain   = "vpc"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [instance, tags]
  }

  tags = {
    Name    = "k8s-worker-1-eip"
    Project = var.project_name
  }
}

resource "aws_eip" "k8s_worker_2" {
  instance = aws_instance.k8s_worker_2.id
  domain   = "vpc"

  lifecycle {
    prevent_destroy = true
    ignore_changes  = [instance, tags]
  }

  tags = {
    Name    = "k8s-worker-2-eip"
    Project = var.project_name
  }
}